import TaskItem from './TaskItem.jsx';

export default function TaskSection({ title, icon, status, tasks, members, onStatusChange }) {
  const filtered = tasks.filter((task) => task.status === status);

  if (filtered.length === 0) return null;

  return (
    <section>
      <h3>{icon} {title}</h3>
      <ul>
        {filtered.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            members={members}
            onStatusChange={onStatusChange}
          />
        ))}
      </ul>
    </section>
  );
}
