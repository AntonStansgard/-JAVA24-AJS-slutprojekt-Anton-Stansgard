import { useState } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '../firebase.js';

export default function AddMember() {
  // Lokal state för formulärfält och status
  const [name, setName] = useState('');            
  const [email, setEmail] = useState('');          
  const [role, setRole] = useState('frontend');    
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [error, setError] = useState(null);        

  // Lista med tillåtna roller (används för validering)
  const validRoles = ['frontend', 'backend', 'ux/design'];

  // Funktion som körs när formuläret skickas
  const handleSubmit = async (e) => {
    e.preventDefault();       
    setError(null);           
    setIsSubmitting(true);   

    try {
      // Kontrollerar att databasen är korrekt initialiserad
      if (!db) throw new Error('Firebase not initialized');

      // Säkerställer att vald roll finns i listan över giltiga roller
      if (!validRoles.includes(role)) {
        throw new Error('Invalid role selected.');
      }

      // Skapar referens till "members" i databasen
      const membersRef = ref(db, 'members');

      // Generera ett unikt ID/ för nya medlemmar
      const newMemberRef = push(membersRef);

      // Sparar medlemmens data i Firebase
      await set(newMemberRef, {
        name: name.trim(),                   
        email: email.trim(),
        role,                                
        createdAt: new Date().toISOString()  
      });

      // Tömmer fälten efter att medlemmen lagts till
      setName('');
      setEmail('');
      setRole('frontend');
    } catch (error) {
      // Om något går fel loggas det till konsolen och visa felmeddelande i UI
      console.error('Error adding member:', error);
      setError(error.message);
    } finally {
     
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-member">
      <h2>Add New Team Member</h2>

      {/* Visar felmeddelande om något gick fel */}
      {error && <div className="error-message">{error}</div>}

      {/* Formulär för att lägga till en ny medlem */}
      <form onSubmit={handleSubmit}>
        {/* Fält för namn */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name"
          required
          minLength={2}
        />

        {/* Fält för e-post */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Member email"
        />

        {/* Dropdown för att välja roll */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="frontend">Frontend</option>
          <option value="backend">Backend</option>
          <option value="ux/design">UX/Design</option>
        </select>

        {/* Knapp för att skicka formuläret */}
        <button 
          type="submit" 
          disabled={isSubmitting || !name.trim()}  
          aria-busy={isSubmitting}                
        >
          {isSubmitting ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
}
