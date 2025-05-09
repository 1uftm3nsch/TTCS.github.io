// Get DOM elements
document.addEventListener('DOMContentLoaded', function() {
  const createRoadmapBtn = document.querySelector('.create-roadmap-btn');
  const roadmapContainer = document.querySelector('.roadmap-container');
  const noRoadmaps = document.querySelector('.no-roadmaps');
  const roadmapModal = document.getElementById('roadmap-modal');
  const closeModalBtn = roadmapModal.querySelector('.modal-close-btn');
  const cancelBtn = roadmapModal.querySelector('.cancel-btn');
  const roadmapForm = document.getElementById('roadmap-form');
  const roadmapNameInput = document.getElementById('roadmap-name');
  const roadmapDescInput = document.getElementById('roadmap-desc');
  const charCount = document.querySelector('.character-count');
  
  // Edit roadmap page elements
  const editRoadmapPage = document.getElementById('edit-roadmap');
  const editRoadmapNameInput = editRoadmapPage ? editRoadmapPage.querySelector('#roadmap-name') : null;
  const editRoadmapDescInput = editRoadmapPage ? editRoadmapPage.querySelector('#roadmap-description') : null;
  const saveChangesBtn = editRoadmapPage ? editRoadmapPage.querySelector('.save-changes-btn') : null;
  
  // Topic modal elements
  const topicModal = document.getElementById('topic-modal');
  const addTopicBtn = editRoadmapPage ? editRoadmapPage.querySelector('.add-topic-btn') : null;
  const topicCloseModalBtn = topicModal ? topicModal.querySelector('.modal-close-btn') : null;
  const topicCancelBtns = topicModal ? topicModal.querySelectorAll('.cancel-btn') : null;
  const topicForm = document.getElementById('topic-form');
  const topicNameInput = document.getElementById('topic-name');
  const topicDescInput = document.getElementById('topic-desc');
  const existingTopicRows = topicModal ? topicModal.querySelectorAll('.topic-table tbody tr') : null;
  const addExistingTopicBtn = topicModal ? topicModal.querySelector('.topic-existing-section .create-btn') : null;
  const topicList = editRoadmapPage ? editRoadmapPage.querySelector('.topic-list') : null;
  const noTopics = editRoadmapPage ? editRoadmapPage.querySelector('.no-topics') : null;
  
  // Page content divs
  const roadmapsPage = document.getElementById('roadmaps');

  // Array to store roadmaps
  let roadmaps = [];
  // Current roadmap being edited
  let currentEditRoadmapId = null;
  // Array to store topics for the current roadmap
  let currentRoadmapTopics = [];
  // Store selected topic from existing topics
  let selectedTopicId = null;

  // Show modal
  function showModal() {
    roadmapModal.classList.add('active');
    // Reset form
    roadmapForm.reset();
    charCount.textContent = '0/80';
  }

  // Close modal
  function closeModal() {
    roadmapModal.classList.remove('active');
  }

  // Add new roadmap
  function addRoadmap(e) {
    e.preventDefault();
    
    const roadmapName = roadmapNameInput.value.trim();
    const roadmapDesc = roadmapDescInput.value.trim();
    
    if (!roadmapName) return;
    
    // Create new roadmap object
    const newRoadmap = {
      id: Date.now(),
      name: roadmapName,
      description: roadmapDesc,
      topics: 0 // Default number of topics
    };
    
    // Add to roadmaps array
    roadmaps.push(newRoadmap);
    
    // Update UI
    updateRoadmapsUI();
    
    // Close modal
    closeModal();
  }

  // Update roadmaps UI
  function updateRoadmapsUI() {
    // Remove "no roadmaps" message if there are roadmaps
    if (roadmaps.length > 0 && noRoadmaps) {
      noRoadmaps.style.display = 'none';
    } else if (roadmaps.length === 0 && noRoadmaps) {
      noRoadmaps.style.display = 'block';
    }
    
    // Check if roadmap list exists, if not create it
    let roadmapList = document.querySelector('.roadmap-list');
    if (!roadmapList) {
      roadmapList = document.createElement('div');
      roadmapList.className = 'roadmap-list';
      roadmapContainer.appendChild(roadmapList);
    }
    
    // Clear existing roadmaps and rebuild the list
    roadmapList.innerHTML = '';
    
    // Add roadmap count
    if (roadmaps.length > 0) {
      const countInfo = document.createElement('div');
      countInfo.className = 'roadmap-count';
      countInfo.textContent = `${roadmaps.length} custom roadmap(s)`;
      roadmapList.appendChild(countInfo);
      
      // Add each roadmap
      roadmaps.forEach(roadmap => {
        const roadmapItem = document.createElement('div');
        roadmapItem.className = 'roadmap-item';
        
        const roadmapInfo = document.createElement('div');
        roadmapInfo.className = 'roadmap-info';
        
        const roadmapTitle = document.createElement('h4');
        roadmapTitle.textContent = roadmap.name;
        
        const roadmapTopics = document.createElement('p');
        roadmapTopics.textContent = `${roadmap.topics} topics`;
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit';
        editBtn.textContent = 'Edit';
        editBtn.dataset.id = roadmap.id;
        editBtn.addEventListener('click', () => editRoadmap(roadmap.id));
        
        roadmapInfo.appendChild(roadmapTitle);
        roadmapInfo.appendChild(roadmapTopics);
        
        roadmapItem.appendChild(roadmapInfo);
        roadmapItem.appendChild(editBtn);
        
        roadmapList.appendChild(roadmapItem);
      });
    }
  }

  // Edit roadmap function
  function editRoadmap(id) {
    // Find the roadmap by id
    const roadmap = roadmaps.find(r => r.id === id);
    if (!roadmap) return;
    
    // Store current edit roadmap id
    currentEditRoadmapId = id;
    
    // Reset current roadmap topics
    currentRoadmapTopics = [];
    
    // Hide roadmaps page and show edit page
    if (roadmapsPage) roadmapsPage.classList.add('hidden');
    if (editRoadmapPage) editRoadmapPage.classList.remove('hidden');
    
    // Populate form fields with roadmap data
    if (editRoadmapNameInput) editRoadmapNameInput.value = roadmap.name;
    if (editRoadmapDescInput) editRoadmapDescInput.value = roadmap.description;
    
    // Update topics UI
    updateTopicsUI();
    
    // Make sure we keep the roadmaps menu item highlighted
    const roadmapsMenuItem = document.querySelector('.menu-item[data-page="roadmaps"]');
    if (roadmapsMenuItem) {
      document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
      roadmapsMenuItem.classList.add('active');
    }
  }
  
  // Save changes to roadmap
  function saveRoadmapChanges() {
    if (currentEditRoadmapId === null) return;
    
    // Find roadmap in array
    const roadmapIndex = roadmaps.findIndex(r => r.id === currentEditRoadmapId);
    if (roadmapIndex === -1) return;
    
    // Update roadmap data
    roadmaps[roadmapIndex].name = editRoadmapNameInput.value.trim();
    roadmaps[roadmapIndex].description = editRoadmapDescInput.value.trim();
    
    // Reset current edit
    currentEditRoadmapId = null;
    
    // Hide edit page and show roadmaps page
    if (editRoadmapPage) editRoadmapPage.classList.add('hidden');
    if (roadmapsPage) roadmapsPage.classList.remove('hidden');
    
    // Update UI
    updateRoadmapsUI();
  }

  // Update character count for description
  if (roadmapDescInput) {
    roadmapDescInput.addEventListener('input', function() {
      const currentLength = this.value.length;
      charCount.textContent = `${currentLength}/80`;
      
      // Optional: Add visual indication if over limit
      if (currentLength > 80) {
        charCount.style.color = '#dc3545';
      } else {
        charCount.style.color = '#999';
      }
    });
  }

  // Event listeners
  if (createRoadmapBtn) {
    createRoadmapBtn.addEventListener('click', showModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
  }

  if (roadmapForm) {
    roadmapForm.addEventListener('submit', addRoadmap);
  }
  
  // Add event listener for save changes button
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', saveRoadmapChanges);
  }

  // Close modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === roadmapModal) {
      closeModal();
    }
  });
  
  // Make sure edit page is properly hidden on page load
  if (editRoadmapPage) {
    editRoadmapPage.classList.add('hidden');
  }
  
  // Topic modal functions
  
  // Show topic modal
  function showTopicModal() {
    if (topicModal) {
      topicModal.classList.add('active');
      // Reset form and selection
      if (topicForm) topicForm.reset();
      resetTopicSelection();
    }
  }
  
  // Close topic modal
  function closeTopicModal() {
    if (topicModal) {
      topicModal.classList.remove('active');
      selectedTopicId = null;
    }
  }
  
  // Reset topic selection in the table
  function resetTopicSelection() {
    if (existingTopicRows) {
      existingTopicRows.forEach(row => {
        row.classList.remove('selected');
      });
      selectedTopicId = null;
    }
  }
  
  // Add a new topic from the form
  function addNewTopic(e) {
    if (e) e.preventDefault();
    
    const topicName = topicNameInput.value.trim();
    const topicDesc = topicDescInput.value.trim();
    
    if (!topicName) return;
    
    // Create new topic object
    const newTopic = {
      id: Date.now(),
      name: topicName,
      description: topicDesc,
      resources: 0 // Default number of resources
    };
    
    // Add to current roadmap topics
    currentRoadmapTopics.push(newTopic);
    
    // Update roadmap's topic count
    if (currentEditRoadmapId !== null) {
      const roadmapIndex = roadmaps.findIndex(r => r.id === currentEditRoadmapId);
      if (roadmapIndex !== -1) {
        roadmaps[roadmapIndex].topics = currentRoadmapTopics.length;
      }
    }
    
    // Update topics UI
    updateTopicsUI();
    
    // Close modal
    closeTopicModal();
  }
  
  // Add an existing topic from the table
  function addExistingTopic() {
    if (selectedTopicId === null) return;
    
    // Get the selected topic from the table
    const selectedRow = document.querySelector(`.topic-table tbody tr:nth-child(${selectedTopicId})`);
    if (!selectedRow) return;
    
    const topicName = selectedRow.querySelector('td:nth-child(2)').textContent;
    
    // Create topic object
    const existingTopic = {
      id: Date.now(),
      name: topicName,
      description: '', // No description available from the table
      resources: 0
    };
    
    // Add to current roadmap topics
    currentRoadmapTopics.push(existingTopic);
    
    // Update roadmap's topic count
    if (currentEditRoadmapId !== null) {
      const roadmapIndex = roadmaps.findIndex(r => r.id === currentEditRoadmapId);
      if (roadmapIndex !== -1) {
        roadmaps[roadmapIndex].topics = currentRoadmapTopics.length;
      }
    }
    
    // Update topics UI
    updateTopicsUI();
    
    // Close modal
    closeTopicModal();
  }
  
  // Update topics UI
  function updateTopicsUI() {
    if (!topicList || !noTopics) return;
    
    // Show or hide "no topics" message
    if (currentRoadmapTopics.length > 0) {
      noTopics.style.display = 'none';
      topicList.style.display = 'block';
    } else {
      noTopics.style.display = 'flex';
      topicList.style.display = 'none';
    }
    
    // Clear existing topics and rebuild the list
    topicList.innerHTML = '';
    
    // Add each topic
    currentRoadmapTopics.forEach(topic => {
      const topicItem = document.createElement('div');
      topicItem.className = 'topic-item';
      
      const topicInfo = document.createElement('div');
      topicInfo.className = 'topic-info';
      
      const topicTitle = document.createElement('h4');
      topicTitle.textContent = topic.name;
      
      const topicResources = document.createElement('p');
      topicResources.textContent = `${topic.resources} resources`;
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-topic';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      deleteBtn.dataset.id = topic.id;
      deleteBtn.addEventListener('click', () => deleteTopic(topic.id));
      
      topicInfo.appendChild(topicTitle);
      topicInfo.appendChild(topicResources);
      
      topicItem.appendChild(topicInfo);
      topicItem.appendChild(deleteBtn);
      
      topicList.appendChild(topicItem);
    });
  }
  
  // Delete topic function
  function deleteTopic(id) {
    // Remove topic from array
    currentRoadmapTopics = currentRoadmapTopics.filter(t => t.id !== id);
    
    // Update roadmap's topic count
    if (currentEditRoadmapId !== null) {
      const roadmapIndex = roadmaps.findIndex(r => r.id === currentEditRoadmapId);
      if (roadmapIndex !== -1) {
        roadmaps[roadmapIndex].topics = currentRoadmapTopics.length;
      }
    }
    
    // Update UI
    updateTopicsUI();
  }
  
  // Event listeners for topic modal
  if (addTopicBtn) {
    addTopicBtn.addEventListener('click', showTopicModal);
  }
  
  if (topicCloseModalBtn) {
    topicCloseModalBtn.addEventListener('click', closeTopicModal);
  }
  
  if (topicCancelBtns) {
    topicCancelBtns.forEach(btn => {
      btn.addEventListener('click', closeTopicModal);
    });
  }
  
  if (topicForm) {
    topicForm.addEventListener('submit', addNewTopic);
  }
  
  if (addExistingTopicBtn) {
    addExistingTopicBtn.addEventListener('click', addExistingTopic);
  }
  
  // Add click event listeners to the existing topic rows
  if (existingTopicRows) {
    existingTopicRows.forEach((row, index) => {
      row.addEventListener('click', function() {
        // Remove selected class from all rows
        existingTopicRows.forEach(r => r.classList.remove('selected'));
        // Add selected class to clicked row
        this.classList.add('selected');
        // Store the selected row index (1-based)
        selectedTopicId = index + 1;
      });
    });
  }
  
  // Close topic modal when clicking outside of it
  window.addEventListener('click', function(event) {
    if (event.target === topicModal) {
      closeTopicModal();
    }
  });

  // Initialize the UI
  updateRoadmapsUI();
});