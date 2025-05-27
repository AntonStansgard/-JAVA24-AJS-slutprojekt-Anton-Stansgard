
import React from 'react';
import { createRoot } from 'react-dom/client';
import AddMember from './components/AddMember';
import MembersList from './components/membersList'; 
import AddTask from './components/Addtask'; 
import TasksList from './components/TaskList'; 
import './css/style.css'; 

function App() {
  return (
    <div className="container">
      <h1>Scrum Board</h1>
      
      <div className="board-sections">
        {/* Team Members Section */}
        <section className="team-section">
          <h2>Team Management</h2>
          <AddMember />
          <MembersList />
        </section>

        {/* Tasks Section */}
        <section className="tasks-section">
          <h2>Task Management</h2>
          <AddTask />
          <TasksList />
        </section>
      </div>
    </div>
  );
}


const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);