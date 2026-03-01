// client/pages/index.tsx
'use client';
import { useEffect, useState } from 'react';
import styles from './styles/home.module.css';
type Todo = { id: string; text: string; done: boolean };

export default function Home() {
	const [todos, setTodos] = useState<Todo[]>([]);
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9000';

	async function load() {
		try {
			setLoading(true);
			const res = await fetch(`${apiBase}/api/todos`);
			const list = await res.json();
			setTodos(list);
		} catch (e) {
			console.error('Failed to load todos', e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function addTodo() {
		const value = text.trim();
		if (!value) return;
		try {
			const res = await fetch(`${apiBase}/api/todos`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: value }),
			});
			const t = await res.json();
			setTodos((prev) => [...prev, t]);
			setText('');
		} catch (e) {
			console.error('Add todo failed', e);
		}
	}

	async function toggle(id: string, done: boolean) {
		// optimistic UI
		setTodos((prev) =>
			prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)),
		);
		try {
			await fetch(`${apiBase}/api/todos/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ done: !done }),
			});
		} catch (e) {
			console.error('Toggle failed', e);
			// reload on error
			load();
		}
	}

	async function remove(id: string) {
		// optimistic UI
		setTodos((prev) => prev.filter((p) => p.id !== id));
		try {
			await fetch(`${apiBase}/api/todos/${id}`, { method: 'DELETE' });
		} catch (e) {
			console.error('Delete failed', e);
			load();
		}
	}

	function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Enter') addTodo();
	}

	return (
		<main className={styles.page}>
			<div className={styles.card} role="region" aria-labelledby="todo-heading">
				<header className={styles.header}>
					<h1 id="todo-heading" className={styles.title}>
						My Minimal Todo
					</h1>
					<p className={styles.subtitle}>
						Client ↔ Server demo — Next.js + Express
					</p>
				</header>

				<section className={styles.inputRow}>
					<label htmlFor="new-todo" className={styles.visuallyHidden}>
						New todo
					</label>
					<input
						id="new-todo"
						className={styles.input}
						placeholder="What do you want to do today?"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={handleKey}
						aria-label="New todo"
					/>
					<button
						type="button"
						className={styles.addButton}
						onClick={addTodo}
						aria-label="Add todo"
						disabled={!text.trim()}
					>
						Add
					</button>
				</section>

				<section className={styles.listSection} aria-live="polite">
					{loading ? (
						<p className={styles.emptyState}>Loading…</p>
					) : todos.length === 0 ? (
						<p className={styles.emptyState}>
							No todos yet — add your first item ✨
						</p>
					) : (
						<ul className={styles.list}>
							{todos.map((t) => (
								<li key={t.id} className={styles.listItem}>
									<label className={styles.checkboxLabel}>
										<input
											type="checkbox"
											checked={t.done}
											onChange={() => toggle(t.id, t.done)}
											className={styles.checkbox}
											aria-checked={t.done}
										/>
										<span
											className={t.done ? styles.todoTextDone : styles.todoText}
										>
											{t.text}
										</span>
									</label>

									<div className={styles.itemActions}>
										<button
											className={styles.iconButton}
											onClick={() => remove(t.id)}
											aria-label={`Delete todo: ${t.text}`}
											title="Delete"
										>
											{/* simple trash icon */}
											<svg
												width="16"
												height="16"
												viewBox="0 0 24 24"
												aria-hidden
											>
												<path
													fill="currentColor"
													d="M9 3v1H4v2h16V4h-5V3H9zm-1 6v9h2V9H8zm6 0v9h2V9h-2zM7 6h10l-1 14H8L7 6z"
												/>
											</svg>
										</button>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>

				<footer className={styles.footer}>
					<small>
						Data is stored in server memory (no database) • For demo only
					</small>
				</footer>
			</div>
		</main>
	);
}
