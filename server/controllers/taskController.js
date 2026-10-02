const db = require("../config/db");

// Create task
const createTask = async (req, res) => {
    try {
        const { title, description, status, assigned_to } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const allowedStatuses = ["todo", "in_progress", "done"];

        const taskStatus = status || "todo";

        if (!allowedStatuses.includes(taskStatus)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        const [result] = await db.execute(
            `INSERT INTO tasks
            (title, description, status, assigned_to)
            VALUES (?, ?, ?, ?)`,
            [
                title.trim(),
                description || null,
                taskStatus,
                assigned_to || null
            ]
        );

        const [tasks] = await db.execute(
    `SELECT
        tasks.*,
        users.username AS assigned_username
     FROM tasks
     LEFT JOIN users
     ON tasks.assigned_to = users.id
     WHERE tasks.id = ?`,
    [result.insertId]
);

const newTask = tasks[0];

const io = req.app.get("io");

if (io) {
    io.emit("task:created", newTask);
}

res.status(201).json({
    message: "Task created successfully",
    task: newTask
});

    } catch (error) {
        console.error("Create task error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get all tasks
const getTasks = async (req, res) => {
    try {
        const [tasks] = await db.execute(
            `SELECT
                tasks.*,
                users.username AS assigned_username
             FROM tasks
             LEFT JOIN users
             ON tasks.assigned_to = users.id
             ORDER BY tasks.created_at DESC`
        );

        res.status(200).json(tasks);

    } catch (error) {
        console.error("Get tasks error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, assigned_to } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        const allowedStatuses = ["todo", "in_progress", "done"];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status"
            });
        }

        const [result] = await db.execute(
            `UPDATE tasks
             SET title = ?,
                 description = ?,
                 status = ?,
                 assigned_to = ?
             WHERE id = ?`,
            [
                title.trim(),
                description || null,
                status,
                assigned_to || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

       const [tasks] = await db.execute(
    `SELECT
        tasks.*,
        users.username AS assigned_username
     FROM tasks
     LEFT JOIN users
     ON tasks.assigned_to = users.id
     WHERE tasks.id = ?`,
    [id]
);

const updatedTask = tasks[0];

// Send the updated task to every connected browser
const io = req.app.get("io");

if (io) {
    io.emit("task:updated", updatedTask);
}

res.status(200).json({
    message: "Task updated successfully",
    task: updatedTask
});

    } catch (error) {
        console.error("Update task error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM tasks WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        const io = req.app.get("io");

if (io) {
    io.emit("task:deleted", {
        id: Number(id)
    });
}

res.status(200).json({
    message: "Task deleted successfully"
});

    } catch (error) {
        console.error("Delete task error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createTask,
    getTasks,
    updateTask,
    deleteTask
};