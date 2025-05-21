import { useState, useEffect } from 'react'
import { List, CheckCircle, Circle } from 'lucide-react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [stakeholders, setStakeholders] = useState([]);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState(null);
  const [todos, setTodos] = useState({}); // Changed: todos is now an object { stakeholderId: [...todos] }
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  const [isLoading, setIsLoading] = useState(true); // New loading state

  // State for adding stakeholder
  const [isAddingStakeholder, setIsAddingStakeholder] = useState(false);
  const [newStakeholderName, setNewStakeholderName] = useState('');
  const [newStakeholderImage, setNewStakeholderImage] = useState(''); // Holds the final URL or Data URL for the avatar
  const [newStakeholderImageUrlInput, setNewStakeholderImageUrlInput] = useState(''); // For the URL text input field

  // State for editing stakeholder
  const [isEditingStakeholder, setIsEditingStakeholder] = useState(false);
  const [stakeholderToEdit, setStakeholderToEdit] = useState(null); // { id, name, avatar }
  const [editStakeholderName, setEditStakeholderName] = useState('');
  const [editStakeholderImage, setEditStakeholderImage] = useState(''); // Holds the final URL or Data URL
  const [editStakeholderImageUrlInput, setEditStakeholderImageUrlInput] = useState(''); // For the URL text input field

  // Load data from localStorage (Revised Logic)
  useEffect(() => {
    console.log("Attempting to load data from localStorage...");
    let loadedStakeholders = [];
    try {
      const storedStakeholders = localStorage.getItem('stakeholders');
      if (storedStakeholders) {
        loadedStakeholders = JSON.parse(storedStakeholders);
        setStakeholders(loadedStakeholders);
        console.log("Loaded stakeholders:", loadedStakeholders);
      } else {
        console.log("No stakeholders found in localStorage, setting to empty array.");
        setStakeholders([]); // Ensure state is empty if nothing in storage
      }
    } catch (error) {
      console.error("Error parsing stakeholders from localStorage:", error);
      localStorage.removeItem('stakeholders');
      setStakeholders([]); // Reset state if storage was corrupted and cleared
    }

    let parsedTodos = {};
    try {
      const storedTodos = localStorage.getItem('todos');
      if (storedTodos) {
        parsedTodos = JSON.parse(storedTodos);
        setTodos(parsedTodos);
        console.log("Loaded todos:", parsedTodos);
      } else {
        console.log("No todos found in localStorage, setting to empty object.");
        setTodos({}); // Ensure state is empty if nothing in storage
      }
    } catch (error) {
      console.error("Error parsing todos from localStorage:", error);
      localStorage.removeItem('todos');
      setTodos({}); // Reset state
    }

    let loadedSelectedId = null;
    try {
      const storedSelectedStakeholderId = localStorage.getItem('selectedStakeholderId');
      if (storedSelectedStakeholderId) {
        loadedSelectedId = JSON.parse(storedSelectedStakeholderId);
        console.log("Loaded selectedStakeholderId:", loadedSelectedId);
      } else {
        console.log("No selectedStakeholderId found in localStorage.");
      }
    } catch (error) {
      console.error("Error parsing selectedStakeholderId from localStorage:", error);
      localStorage.removeItem('selectedStakeholderId');
      // loadedSelectedId remains null
    }

    let finalSelectedId = null;
    if (loadedSelectedId !== null && loadedStakeholders.some(sh => sh.id === loadedSelectedId)) {
      finalSelectedId = loadedSelectedId;
    } else if (loadedStakeholders.length > 0) {
      console.log("Selecting first stakeholder as default.");
      finalSelectedId = loadedStakeholders[0].id;
    } // else finalSelectedId remains null
    setSelectedStakeholderId(finalSelectedId);

    setIsLoading(false); // Set loading to false after all initial state is set
    console.log("Finished loading data from localStorage. isLoading set to false.");
  }, []);

  // Save stakeholders to localStorage
  useEffect(() => {
    if (isLoading) {
      console.log("Skipping save for STAKEHOLDERS: initial loading is in progress.");
      return;
    }
    console.log("Attempting to save stakeholders:", stakeholders);
    try {
      localStorage.setItem('stakeholders', JSON.stringify(stakeholders));
      console.log("Stakeholders saved successfully.");
    } catch (error) {
      console.error("Error saving stakeholders to localStorage:", error);
    }
  }, [stakeholders, isLoading]);

  // Save todos to localStorage
  useEffect(() => {
    if (isLoading) {
      console.log("Skipping save for TODOS: initial loading is in progress.");
      return;
    }
    console.log("Attempting to save todos:", todos);
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
      console.log("Todos saved successfully.");
    } catch (error) {
      console.error("Error saving todos to localStorage:", error);
    }
  }, [todos, isLoading]);

  // Save selectedStakeholderId to localStorage
  useEffect(() => {
    if (isLoading && selectedStakeholderId === null && !localStorage.getItem('selectedStakeholderId')) {
      // Special condition: if loading, selectedId is null (initial), and nothing was in local storage,
      // it is okay to skip. Otherwise, selectedStakeholderId might have been set to a loaded value
      // or a default from loaded stakeholders, or intentionally to null by user action post-load.
      console.log("Skipping save for SELECTED ID (initial null): initial loading in progress.");
      return;
    }
    if (isLoading && selectedStakeholderId !== null) {
        // If selectedStakeholderId was set from loaded data or default during isLoading phase,
        // we wait for isLoading to be false to save it.
        console.log("Skipping save for SELECTED ID (set during load): initial loading in progress, will save once load completes.");
        return;
    }

    console.log("Attempting to save selectedStakeholderId:", selectedStakeholderId);
    try {
      if (selectedStakeholderId !== null) {
        localStorage.setItem('selectedStakeholderId', JSON.stringify(selectedStakeholderId));
        console.log("selectedStakeholderId saved successfully.");
      } else {
        localStorage.removeItem('selectedStakeholderId');
        console.log("selectedStakeholderId removed from localStorage.");
      }
    } catch (error) {
      console.error("Error saving/removing selectedStakeholderId to/from localStorage:", error);
    }
  }, [selectedStakeholderId, isLoading]);

  const handleImageFileChange = (event, setImageStateCallback, setImageUrlInputCallback) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageStateCallback(reader.result); // reader.result is the base64 string
        if (setImageUrlInputCallback) setImageUrlInputCallback(''); // Clear URL field if file is uploaded
      };
      reader.readAsDataURL(file);
    } else {
      // If no file is chosen (e.g., dialog cancelled), do nothing or reset to URL if desired
      // For now, current newStakeholderImage/editStakeholderImage remains.
    }
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim() === '' || !selectedStakeholderId) return;
    const newTodoItem = { id: Date.now(), text: newTodo, completed: false };
    setTodos(prevTodos => ({
      ...prevTodos,
      [selectedStakeholderId]: [...(prevTodos[selectedStakeholderId] || []), newTodoItem]
    }));
    setNewTodo('');
  };

  const toggleTodo = (id) => {
    if (!selectedStakeholderId) return;
    setTodos(prevTodos => ({
      ...prevTodos,
      [selectedStakeholderId]: (prevTodos[selectedStakeholderId] || []).map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    }));
  };

  const deleteTodo = (id) => {
    if (!selectedStakeholderId) return;
    setTodos(prevTodos => ({
      ...prevTodos,
      [selectedStakeholderId]: (prevTodos[selectedStakeholderId] || []).filter(todo => todo.id !== id)
    }));
  };

  const clearCompleted = () => {
    if (!selectedStakeholderId) return;
    setTodos(prevTodos => ({
      ...prevTodos,
      [selectedStakeholderId]: (prevTodos[selectedStakeholderId] || []).filter(todo => !todo.completed)
    }));
  };

  const currentTodos = todos[selectedStakeholderId] || [];

  const filteredTodos = currentTodos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const handleSelectStakeholder = (id) => {
    setSelectedStakeholderId(id);
    setIsAddingStakeholder(false); // Close form if open
  };

  const handleAddStakeholder = (e) => {
    e.preventDefault();
    if (newStakeholderName.trim() === '') return;
    const newId = Date.now();
    const newStakeholder = {
      id: newId,
      name: newStakeholderName.trim(),
      avatar: newStakeholderImage.trim() || null, // Store image URL or null
    };
    setStakeholders([...stakeholders, newStakeholder]);
    setNewStakeholderName('');
    setNewStakeholderImage('');
    setNewStakeholderImageUrlInput('');
    setIsAddingStakeholder(false);
    setSelectedStakeholderId(newId); // Auto-select the newly added stakeholder
    setTodos(prevTodos => ({
      ...prevTodos,
      [newId]: []
    }));
    setIsEditingStakeholder(false); // Close edit form if open
  };

  const handleOpenEditStakeholder = (stakeholder) => {
    setStakeholderToEdit(stakeholder);
    setEditStakeholderName(stakeholder.name);
    const avatarValue = stakeholder.avatar || '';
    setEditStakeholderImage(avatarValue);
    if (avatarValue.startsWith('http')) {
      setEditStakeholderImageUrlInput(avatarValue);
    } else {
      setEditStakeholderImageUrlInput('');
    }
    setIsEditingStakeholder(true);
    setIsAddingStakeholder(false); // Close add form if open
  };

  const handleUpdateStakeholder = (e) => {
    e.preventDefault();
    if (!stakeholderToEdit || editStakeholderName.trim() === '') return;

    setStakeholders(prevStakeholders => 
      prevStakeholders.map(sh => 
        sh.id === stakeholderToEdit.id 
          ? { ...sh, name: editStakeholderName.trim(), avatar: editStakeholderImage.trim() || null } 
          : sh
      )
    );
    setIsEditingStakeholder(false);
    setStakeholderToEdit(null);
    setEditStakeholderImageUrlInput(''); // Reset image URL input field
  };

  const getAvatarDisplay = (stakeholder) => {
    const avatarSrc = stakeholder.avatar;
    if (avatarSrc) {
      return <img src={avatarSrc} alt={stakeholder.name} className="avatar-image" />;
    }
    // First letter of each word for initials
    const initials = stakeholder.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
    return <div className="avatar-initials">{initials}</div>;
  };

  return (
    <div className="app-container">
      <header>
      <div className="stakeholders-list">
          {stakeholders.map(sh => (
            <div 
              key={sh.id} 
              className={`stakeholder-avatar ${selectedStakeholderId === sh.id ? 'selected' : ''}`}
              onClick={() => handleSelectStakeholder(sh.id)}
              title={sh.name}
            >
              <div className="avatar-display-container">
                {getAvatarDisplay(sh)}
              </div>
              <p className="stakeholder-name">{sh.name}</p>
              <button onClick={() => handleOpenEditStakeholder(stakeholders.find(sh => sh.id === selectedStakeholderId))} className="edit-stakeholder-button">
                Edit Details
              </button>
            </div>
          ))}
          <button 
            onClick={() => setIsAddingStakeholder(true)} 
            className="add-stakeholder-button avatar-placeholder"
            title="Add New Stakeholder"
          >
            +
          </button>
        </div>
      </header>
      <div className="stakeholders-section">
      {selectedStakeholderId ? 
          <form onSubmit={handleAddTodo} className="todo-form">
            <span className="prompt">&gt;</span>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="todo-input"
            />
            <button type="submit" className="add-button">ADD</button>
          </form>
          : (
        <p className="info-text">Please select or add a stakeholder to see their tasks.</p>
      )} 
        {/* <div className="stakeholders-list-header">
          {selectedStakeholderId && stakeholders.find(sh => sh.id === selectedStakeholderId) && (
            <div className="selected-stakeholder-info">
              <h2>Tasks for: {stakeholders.find(sh => sh.id === selectedStakeholderId).name}</h2>
              <button onClick={() => handleOpenEditStakeholder(stakeholders.find(sh => sh.id === selectedStakeholderId))} className="edit-stakeholder-button">
                Edit Details
              </button>
            </div>
          )}
        </div> */}


        {isAddingStakeholder && !isEditingStakeholder && (
          <form onSubmit={handleAddStakeholder} className="add-stakeholder-form stakeholder-form">
            <h3>Add New Stakeholder</h3>
            <input 
              type="text" 
              value={newStakeholderName} 
              onChange={(e) => setNewStakeholderName(e.target.value)} 
              placeholder="Stakeholder Name (e.g., Mom, Bank)"
              required 
            />
            {newStakeholderImage && <img src={newStakeholderImage} alt="Preview" className="image-preview"/>}
            <label htmlFor="newStakeholderImageUrlField">Avatar Image URL (optional):</label>
            <input 
              type="text" 
              id="newStakeholderImageUrlField"
              value={newStakeholderImageUrlInput} 
              onChange={(e) => {
                setNewStakeholderImageUrlInput(e.target.value);
                setNewStakeholderImage(e.target.value); // Update main image state if URL is typed
              }} 
              placeholder="Paste image URL or upload file"
            />
            <label htmlFor="newStakeholderImageFile">Or Upload Image:</label>
            <input 
              type="file" 
              id="newStakeholderImageFile"
              accept="image/*"
              onChange={(e) => handleImageFileChange(e, setNewStakeholderImage, setNewStakeholderImageUrlInput)}
            />
            <button type="submit">Add Stakeholder</button>
            <button type="button" onClick={() => setIsAddingStakeholder(false)}>Cancel</button>
          </form>
        )}

        {isEditingStakeholder && stakeholderToEdit && (
          <form onSubmit={handleUpdateStakeholder} className="edit-stakeholder-form stakeholder-form">
            <h3>Edit: {stakeholderToEdit.name}</h3>
            <label htmlFor="editName">Name:</label>
            <input 
              type="text" 
              id="editName"
              value={editStakeholderName} 
              onChange={(e) => setEditStakeholderName(e.target.value)} 
              placeholder="Stakeholder Name"
              required 
            />
            {editStakeholderImage && <img src={editStakeholderImage} alt="Preview" className="image-preview"/>}
            <label htmlFor="editStakeholderImageUrlField">Avatar Image URL:</label>
            <input 
              type="text" 
              id="editStakeholderImageUrlField"
              value={editStakeholderImageUrlInput} 
              onChange={(e) => {
                setEditStakeholderImageUrlInput(e.target.value);
                setEditStakeholderImage(e.target.value); // Update main image state if URL is typed
              }}
              placeholder="Paste image URL or upload file"
            />
            <label htmlFor="editStakeholderImageFile">Or Upload New Image:</label>
            <input 
              type="file" 
              id="editStakeholderImageFile"
              accept="image/*"
              onChange={(e) => handleImageFileChange(e, setEditStakeholderImage, setEditStakeholderImageUrlInput)}
            />
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setIsEditingStakeholder(false)}>Cancel</button>
          </form>
        )}
      </div>
      <div className="filter-buttons">
            <button 
              onClick={() => setFilter('all')} 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              title="All Tasks"
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setFilter('active')} 
              className={`filter-button ${filter === 'active' ? 'active' : ''}`} 
              title="Active Tasks"
            >
              <Circle size={20} />
            </button>
            <button 
              onClick={() => setFilter('completed')} 
              className={`filter-button ${filter === 'completed' ? 'active' : ''}`} 
              title="Completed Tasks"
            >
              <CheckCircle size={20} />
            </button>
          </div>
      <main>
      {selectedStakeholderId ? (
        <>
          {/* <form onSubmit={handleAddTodo} className="todo-form">
            <span className="prompt">&gt;</span>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="todo-input"
            />
            <button type="submit" className="add-button">ADD</button>
          </form> */}


          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <span onClick={() => toggleTodo(todo.id)} className="todo-text">
                  [{todo.completed ? 'x' : ' '}] {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="delete-button">DEL</button>
              </li>
            ))}
          </ul>
          {currentTodos.some(todo => todo.completed) && (
            <button onClick={clearCompleted} className="clear-completed-button">
              Clear Completed Tasks
            </button>
          )}
        </>
      ) : (
        <p className="info-text">Please select or add a stakeholder to see their tasks.</p>
      )}
      </main>
      <footer>
      <h1>ToWhoList 
          {/* <div className="cursor">_</div> */}
          </h1>
        {/* <p>SYSTEM READY. {selectedStakeholderId ? filteredTodos.length : 0} task(s) displayed. {selectedStakeholderId ? currentTodos.filter(t => !t.completed).length : 0} active.</p> */}
      </footer>
    </div>
  )
}

export default App
