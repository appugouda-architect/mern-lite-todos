const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

let todos = ['Sample todo item']; // in-memory list { id, text, done }

app.get('/', (req, res) => {
	res.json({ message: 'Welcome to the Todo API!' });
});

app.get('/api/todos', (req, res) => {
	res.json(todos);
});

app.post('/api/todos', (req, res) => {
	const { text } = req.body;
	if (!text) return res.status(400).json({ error: 'text required' });
	const todo = { id: Date.now().toString(), text, done: false };
	todos.push(todo);
	res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
	const { id } = req.params;
	const { text, done } = req.body;
	const t = todos.find((x) => x.id === id);
	if (!t) return res.status(404).json({ error: 'not found' });
	if (text !== undefined) t.text = text;
	if (done !== undefined) t.done = done;
	res.json(t);
});

app.delete('/api/todos/:id', (req, res) => {
	const { id } = req.params;
	todos = todos.filter((x) => x.id !== id);
	res.status(204).send();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`API listening on ${PORT}`));
