const readline = require('readline');
const tm = require('./taskManager');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// バリデーション付き入力ヘルパー
async function askDueDate() {
    while (true) {
        const input = await ask('期限 (YYYY-MM-DD、または「今日」「明日」): ');
        const parsed = tm.parseDueDate(input.trim());
        if (parsed) return parsed;
        console.log('❌ エラー: 正しい形式（YYYY-MM-DD, 今日, 明日）で入力してください。');
    }
}

async function askPriority() {
    while (true) {
        const input = await ask('優先度 (1〜5): ');
        const priority = parseInt(input, 10);
        if (priority >= 1 && priority <= 5) return priority;
        console.log('❌ エラー: 1〜5の数値を入力してください。');
    }
}

// 状態管理
let currentFilter = 'すべて';
let currentSort = '作成順';

async function mainMenu() {
    console.log('\n========================================');
    console.log(`【タスク一覧】（表示: ${currentFilter} / 順序: ${currentSort}）`);
    console.log('========================================');

    const tasks = tm.getTasks(currentFilter, currentSort);

    if (tasks.length === 0) {
        console.log('該当するタスクはありません。');
    } else {
        tasks.forEach(t => {
            const badge = t.status === '完了' ? '[✔ 完了]' : '[☐ 未完了]';
            console.log(`ID: ${t.id} | ${badge} ${t.title} (期限: ${t.dueDate}, 優先度: ${t.priority})`);
        });
    }

    console.log('----------------------------------------');
    console.log('1: 追加 | 2: 編集 | 3: 完了切替 | 4: 削除');
    console.log('5: 表示切り替え | 6: 並び替え変更 | 0: 終了');
    console.log('----------------------------------------');

    const choice = await ask('操作を選択してください: ');

    switch (choice.trim()) {
        case '1':
            const title = await ask('タスク名: ');
            const dueDate = await askDueDate();
            const priority = await askPriority();
            tm.addTask(title, dueDate, priority);
            console.log('✅ タスクを追加しました。');
            break;

        case '2':
            const editId = parseInt(await ask('編集するタスクのID: '), 10);
            const newTitle = await ask('新しいタスク名 (スキップはEnter): ');
            
            console.log('新しい期限を設定します（スキップはEnter）');
            const dateInput = await ask('期限 (YYYY-MM-DD/今日/明日): ');
            const parsedDate = dateInput.trim() ? tm.parseDueDate(dateInput.trim()) : null;

            console.log('新しい優先度を設定します（スキップはEnter）');
            const priorityInput = await ask('優先度 (1〜5): ');
            const parsedPriority = priorityInput.trim() ? parseInt(priorityInput, 10) : null;

            const successEdit = tm.editTask(editId, newTitle, parsedDate, parsedPriority);
            if (successEdit) console.log('✅ タスクを更新しました。');
            else console.log('❌ 該当するIDが見つかりません。');
            break;

        case '3':
            const toggleId = parseInt(await ask('完了/未完了を切り替えるタスクのID: '), 10);
            const newStatus = tm.toggleTask(toggleId);
            if (newStatus) console.log(`✅ ステータスを「${newStatus}」に更新しました。`);
            else console.log('❌ 該当するIDが見つかりません。');
            break;

        case '4':
            const deleteId = parseInt(await ask('削除するタスクのID: '), 10);
            const successDelete = tm.deleteTask(deleteId);
            if (successDelete) console.log('✅ タスクを削除しました。');
            else console.log('❌ 該当するIDが見つかりません。');
            break;

        case '5':
            console.log('1: すべて | 2: 未完了のみ | 3: 完了済みのみ');
            const fChoice = await ask('フィルターを選択: ');
            if (fChoice === '1') currentFilter = 'すべて';
            if (fChoice === '2') currentFilter = '未完了のみ';
            if (fChoice === '3') currentFilter = '完了済みのみ';
            break;

        case '6':
            console.log('1: 作成順 | 2: 優先度順 | 3: 期限順');
            const sChoice = await ask('ソート順を選択: ');
            if (sChoice === '1') currentSort = '作成順';
            if (sChoice === '2') currentSort = '優先度順';
            if (sChoice === '3') currentSort = '期限順';
            break;

        case '0':
            console.log('アプリケーションを終了します。');
            rl.close();
            return;

        default:
            console.log('❌ 不正な選択です。');
    }

    await mainMenu();
}

// 起動
mainMenu();