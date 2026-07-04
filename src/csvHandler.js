const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, 'tasks.csv');

// CSV読み込み
function readTasks() {
    if (!fs.existsSync(CSV_FILE)) {
        return [];
    }
    const data = fs.readFileSync(CSV_FILE, 'utf-8');
    const lines = data.trim().split('\n');
    if (lines.length <= 1) return [];

    return lines.slice(1).map(line => {
        const [id, title, dueDate, priority, status, createdAt] = line.split(',');
        return {
            id: parseInt(id, 10),
            title: decodeURIComponent(title),
            dueDate,
            priority: parseInt(priority, 10),
            status,
            createdAt
        };
    });
}

// CSV書き込み
function writeTasks(tasks) {
    const header = 'id,title,dueDate,priority,status,createdAt\n';
    const rows = tasks.map(t => 
        `${t.id},${encodeURIComponent(t.title)},${t.dueDate},${t.priority},${t.status},${t.createdAt}`
    ).join('\n');
    fs.writeFileSync(CSV_FILE, header + rows, 'utf-8');
}

module.exports = { readTasks, writeTasks };