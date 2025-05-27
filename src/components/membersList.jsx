
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase.js';  

export default function MembersList() {
  // Lokal state
  const [members, setMembers] = useState([]);     
  const [loading, setLoading] = useState(true);   
  const [error, setError] = useState(null);       

  // useEffect för att hämta data från Firebase när komponenten monteras
  useEffect(() => {
    if (!db) {
      // Om databasen inte är korrekt initierad, visas fel
      setError('Firebase database not initialized');
      setLoading(false);
      return;
    }

    const membersRef = ref(db, 'members');

   
    const unsubscribe = onValue(
      membersRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            // Om data finns, konvertera objekt till array med ID
            const membersData = snapshot.val();
            const membersArray = Object.keys(membersData).map((key) => ({
              id: key,
              ...membersData[key]
            }));
            setMembers(membersArray);  
          } else {
            
            setMembers([]);
          }
          setError(null); 
        } catch (err) {
          console.error('Error processing data:', err);
          setError('Failed to process member data');
        } finally {
          setLoading(false);  
        }
      },
      (error) => {
        // Fel vid anslutning till Firebase
        console.error('Firebase error:', error);
        setError('Failed to load members');
        setLoading(false);
      }
    );

    
    return () => unsubscribe();
  }, []);

  
  if (loading) return <div className="loading">Loading members...</div>;

  // Visar felmeddelande om något gick fel
  if (error) return <div className="error">{error}</div>;

  // Renderar medlemslistan
  return (
    <div className="members-list">
      <h2>Team Members ({members.length})</h2>

      {members.length === 0 ? (
        // Om inga medlemmar finns, visas ett meddelande
        <p className="empty-message">No team members yet. Add some!</p>
      ) : (
        // Listar alla medlemmar
        <ul className="members-container">
          {members.map((member) => (
            <li key={member.id} className="member-item">
              <div className="member-info">
                <strong>{member.name}</strong> {/* Namn */}
                <span className="role-badge">{member.role}</span> {/* Roll */}
              </div>
              <div className="member-email">
                {/* Visa e-post eller "No email" om det saknas */}
                {member.email || <span className="no-email">No email</span>}
              </div>
              <div className="member-meta">
                {/* Formaterat datum för när medlemmen lades till */}
                Added: {new Date(member.createdAt).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
