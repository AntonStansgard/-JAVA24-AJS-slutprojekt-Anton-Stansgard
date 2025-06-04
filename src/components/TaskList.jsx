import { useEffect, useState } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { db } from '../firebase.js';
import TaskSection from './TaskSection.jsx';
import TaskFilter from './TaskFilter.jsx';

export default function TasksList() {
  // State för uppgifter, medlemmar, laddning
  const [tasks, setTasks] = useState([]);         
  const [members, setMembers] = useState([]);     
  const [loading, setLoading] = useState(true);   

  // filter & sortering 
  const [filterCategory, setFilterCategory] = useState('');      
  const [filterMember, setFilterMember] = useState('');          
  const [sortBy, setSortBy] = useState('timestamp-desc');        

  // useEffect: Hämtar uppgifter från Firebase 
  useEffect(() => {
    const tasksRef = ref(db, 'tasks');  // Referens till "tasks" i Firebase
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Omvandlar objekt till array med ID som nyckel
        const array = Object.entries(data).map(([id, task]) => ({ id, ...task }));
        setTasks(array);
      } else {
        setTasks([]);
      }
      setLoading(false);
    });

    return () => unsubscribe(); 
  }, []);

  // useEffect: Hämtar teammedlemmar från Firebase
  useEffect(() => {
    const membersRef = ref(db, 'members');  // Referens till "members" i Firebase
    const unsubscribe = onValue(membersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Omvandlar objekt till array med ID som nyckel
        const array = Object.entries(data).map(([id, member]) => ({ id, ...member }));
        setMembers(array);
      } else {
        setMembers([]);
      }
    });

    return () => unsubscribe(); 
  }, []);

  // Funktion för att hantera statusändring 
  const handleStatusChange = async (taskId, newStatus, assignedTo = null) => {
    const taskRef = ref(db, `tasks/${taskId}`); 
    try {
      if (newStatus === 'delete') {
        // Bekräftelse innan permanent borttagning
        const confirmed = window.confirm('Are you sure you want to delete this task permanently?');
        if (!confirmed) return;
        await remove(taskRef);  // Ta bort uppgift från Firebase
      } else {
        // Uppdatera status eller tilldelad medlem
        await update(taskRef, {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(assignedTo !== null && { assignedTo }) // Endast om tilldelad medlem anges
        });
      }
    } catch (error) {
      console.error('Failed to update or delete task:', error);
      alert('Something went wrong updating the task status.');
    }
  };

  // Skapar en lista med unika kategorier
  const categories = [...new Set(tasks.map((t) => t.category))];

  // Filtrering och sortering av uppgifter 
  const filteredTasks = tasks
    .filter((task) => !filterCategory || task.category === filterCategory) // Filtrera på kategori
    .filter((task) => !filterMember || task.assignedTo === filterMember)   // Filtrera på ansvarig
    .sort((a, b) => {
      // Sortering baserat på valt sorteringsalternativ
      if (sortBy === 'timestamp-desc') {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (sortBy === 'timestamp-asc') {
        return new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

  // Filtrerar uppgifter på status till varje TaskSection
  const groupByStatus = (status) => filteredTasks.filter((task) => task.status === status);

  // Visar laddningsindikator medan data hämtas
  if (loading) return <div className="loading">Loading tasks...</div>;

  return (
    <div className="tasks-list">
      <h2>All Tasks</h2>

      {/* Filtreringskomponent med kategori, ansvarig och sortering */}
      <TaskFilter
        categories={categories}
        members={members}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        filterMember={filterMember}
        setFilterMember={setFilterMember}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* Varje sektion visar uppgifter med viss status */}
      <TaskSection
        title="New"
        icon="🆕"
        status="new"
        tasks={groupByStatus('new')}
        members={members}
        onStatusChange={handleStatusChange}
      />

      <TaskSection
        title="In Progress"
        icon="🚧"
        status="in-progress"
        tasks={groupByStatus('in-progress')}
        members={members}
        onStatusChange={handleStatusChange}
      />

      <TaskSection
        title="Finished"
        icon="✅"
        status="done"
        tasks={groupByStatus('done')}
        members={members}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
