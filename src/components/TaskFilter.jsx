
export default function TaskFilter({
  categories,
  members,
  filterCategory,
  setFilterCategory,
  filterMember,
  setFilterMember,
  sortBy,
  setSortBy
}) {
  return (
    <div className="filter-controls">
      <select
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <select
        value={filterMember}
        onChange={(e) => setFilterMember(e.target.value)}
      >
        <option value="">All Members</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="timestamp-desc">Newest First</option>
        <option value="timestamp-asc">Oldest First</option>
        <option value="title-asc">Title A–Z</option>
        <option value="title-desc">Title Z–A</option>
      </select>
    </div>
  );
}
