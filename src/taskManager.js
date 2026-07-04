const { readTasks, writeTasks } = require('./csvHandler');

// 日付のパース（「今日」「明日」を YYYY-MM-DD に変換）
function parseDueDate(input) {
    const today = new Date();
    if (input === '今日') return today.toISOString().split('T')[0];
    if (input === '明日') {
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    return null;
}

// 一覧の取得（フィルターとソートを適用）
function getTasks(filter, sort) {
    let tasks = readTasks();

    // フィルター適用
    if (filter === '未完了のみ') tasks = tasks.filter(t => t.status === '未完了');
    if (filter === '完了済みのみ') tasks = tasks.filter(t => t.status === '完了');

    // ソート適用
    if (sort === '優先度順') {
        tasks.sort((a, b) => b.priority - a.priority);
    } else if (sort === '期限順') {
        tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    } else {
        tasks.sort((a, b) => a.id - b.id); // 作成順（ID順）
    }
    return tasks;
}

// 追加
function addTask(title, dueDate, priority) {
    const tasks = readTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    tasks.push({
        id: newId,
        title,
        dueDate,
        priority,
        status: '未完了',
        createdAt: new Date().toISOString()
    });
    writeTasks(tasks);
}

// 編集
function editTask(id, newTitle, newDate, newPriority) {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return false;

    if (newTitle.trim() !== '') task.title = newTitle;
    if (newDate) task.dueDate = newDate;
    if (newPriority) task.priority = newPriority;

    writeTasks(tasks);
    return true;
}

// 完了切替
function toggleTask(id) {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    task.status = task.status === '未完了' ? '完了' : '未完了';
    writeTasks(tasks);
    return task.status;
}

// 削除
function deleteTask(id) {
    const tasks = readTasks();
    const filtered = tasks.filter(t => t.id !== id);
    if (tasks.length === filtered.length) return false;

    writeTasks(filtered);
    return true;
}

module.exports = { parseDueDate, getTasks, addTask, editTask, toggleTask, deleteTask };