'use client';

import { useEffect, useState } from 'react';

type Todo = { id: string; text: string; done: boolean };

export default function Home() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [text, setText] = useState('');
	const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
	console.log(apiBase);

	async function load() {
		const res = await fetch(`${apiBase}/api/todos`);
		setTodos(await res.json());
	}
	useEffect(() => {
		load();
	}, []);

	async function addTodo() {
		if (!text.trim()) return;
		const res = await fetch(`${apiBase}/api/todos`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text }),
		});
		const t = await res.json();
		setTodos((prev) => [...prev, t]);
		setText('');
	}

	async function toggle(id: string, done: boolean) {
		await fetch(`${apiBase}/api/todos/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ done: !done }),
		});
		setTodos((prev) =>
			prev.map((p) => (p.id === id ? { ...p, done: !done } : p)),
		);
	}

	async function del(id: string) {
		await fetch(`${apiBase}/api/todos/${id}`, { method: 'DELETE' });
		setTodos((prev) => prev.filter((p) => p.id !== id));
	}

	return (
		<main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
			<h1>Minimal Todo (Next.js → Express)</h1>
			<div style={{ marginBottom: 12 }}>
				<input
					value={text}
					onChange={(e) => setText(e.target.value)}
					placeholder="New todo"
				/>
				<button
					onClick={addTodo}
					style={{
						marginLeft: 8,
						padding: '4px 12px',
						backgroundColor: '#0070f3',
						color: '#fff',
						border: 'none',
						borderRadius: 4,
						cursor: 'pointer',
					}}
				>
					Add
				</button>
			</div>
			<ul>
				{todos.map((t) => (
					<li key={t.id} style={{ marginBottom: 8 }}>
						<input
							type="checkbox"
							checked={t.done}
							onChange={() => toggle(t.id, t.done)}
						/>
						<span
							style={{
								marginLeft: 8,
								textDecoration: t.done ? 'line-through' : 'none',
							}}
						>
							{t.text}
						</span>
						<button
							onClick={() => del(t.id)}
							style={{
								marginLeft: 12,
								padding: '2px 8px',
								backgroundColor: '#ff4d4d',
								color: '#fff',
								border: 'none',
								borderRadius: 4,
								cursor: 'pointer',
							}}
						>
							Delete
						</button>
					</li>
				))}
			</ul>
		</main>
	);
}
