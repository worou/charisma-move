import React, { useEffect, useState, memo } from 'react';

function DataList() {
  const [items, setItems] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  const handleAdd = () => {
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: value })
    })
      .then(res => res.json())
      .then(item => setItems([...items, item]))
      .then(() => setValue(''))
      .catch(console.error);
  };

  return (
    <div>
      <h2>Items</h2>
      <ul>
        {items.map(it => (
          <li key={it.id}>{it.name}</li>
        ))}
      </ul>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <button onClick={handleAdd}>Add</button>
    </div>
  );
}

export default memo(DataList);
