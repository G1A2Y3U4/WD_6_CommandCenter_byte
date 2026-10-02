import { useEffect, useState } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable
} from "@dnd-kit/core";

import api from "../api";
import socket from "../socket";


// =====================================================
// KANBAN COLUMNS
// =====================================================

const columns = [
    {
        id: "todo",
        title: "To Do",
        icon: "📝",
        color: "#f59e0b",
        background: "#fffbeb"
    },
    {
        id: "in_progress",
        title: "In Progress",
        icon: "🔄",
        color: "#3b82f6",
        background: "#eff6ff"
    },
    {
        id: "done",
        title: "Done",
        icon: "✅",
        color: "#10b981",
        background: "#ecfdf5"
    }
];


// =====================================================
// KANBAN COLUMN COMPONENT
// =====================================================

function KanbanColumn({
    column,
    tasks,
    onDelete,
    onEdit
}) {

    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id: column.id
    });


    return (
        <div
            ref={setNodeRef}
            style={{
                ...styles.column,

                backgroundColor: isOver
                    ? "#e0f2fe"
                    : column.background,

                borderColor: isOver
                    ? column.color
                    : "#e2e8f0"
            }}
        >

            {/* COLUMN HEADER */}

            <div style={styles.columnHeader}>

                <div style={styles.columnTitleWrapper}>

                    <span
                        style={{
                            ...styles.columnIcon,
                            backgroundColor:
                                column.color
                        }}
                    >
                        {column.icon}
                    </span>

                    <h2 style={styles.columnTitle}>
                        {column.title}
                    </h2>

                </div>


                <span style={styles.count}>
                    {tasks.length}
                </span>

            </div>


            {/* EMPTY STATE */}

            {tasks.length === 0 && (

                <div style={styles.emptyState}>

                    <div style={styles.emptyIcon}>
                        {column.icon}
                    </div>

                    <p style={styles.emptyTitle}>
                        No tasks here
                    </p>

                    <p style={styles.emptyText}>
                        Drag a task into this column
                    </p>

                </div>

            )}


            {/* TASKS */}

            {tasks.map((task) => (

                <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onEdit={onEdit}
                />

            ))}

        </div>
    );
}


// =====================================================
// TASK CARD COMPONENT
// =====================================================

function TaskCard({
    task,
    onDelete,
    onEdit
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: String(task.id)
    });


    const currentColumn =
        columns.find(
            (column) =>
                column.id === task.status
        ) || columns[0];


    const cardStyle = {

        ...styles.card,

        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,

        opacity: isDragging
            ? 0.55
            : 1,

        boxShadow: isDragging
            ? "0 12px 30px rgba(15, 23, 42, 0.20)"
            : "0 4px 12px rgba(15, 23, 42, 0.06)",

        borderColor: isDragging
            ? currentColumn.color
            : "#e2e8f0",

        zIndex: isDragging
            ? 100
            : 1
    };


    return (

        <div
            ref={setNodeRef}
            style={cardStyle}
            {...listeners}
            {...attributes}
        >

            {/* TASK TITLE */}

            <div style={styles.taskHeader}>

                <h3 style={styles.taskTitle}>
                    {task.title}
                </h3>

                <span
                    style={{
                        ...styles.statusDot,
                        backgroundColor:
                            currentColumn.color
                    }}
                />

            </div>


            {/* DESCRIPTION */}

            <p style={styles.description}>
                {task.description ||
                    "No description provided"}
            </p>


            {/* ASSIGNED USER */}

            {task.assigned_username && (

                <div style={styles.assignedUser}>

                    <span style={styles.userIcon}>
                        👤
                    </span>

                    <span>
                        {task.assigned_username}
                    </span>

                </div>

            )}


            {/* STATUS BADGE */}

            <div
                style={{
                    ...styles.statusBadge,

                    color:
                        currentColumn.color,

                    backgroundColor:
                        `${currentColumn.color}15`
                }}
            >
                {currentColumn.icon}{" "}
                {currentColumn.title}
            </div>


            {/* ACTION BUTTONS */}

            <div style={styles.actions}>

                <button
                    onPointerDown={(event) =>
                        event.stopPropagation()
                    }
                    onClick={() =>
                        onEdit(task)
                    }
                    style={styles.editButton}
                >
                    ✏️ Edit
                </button>


                <button
                    onPointerDown={(event) =>
                        event.stopPropagation()
                    }
                    onClick={() =>
                        onDelete(task.id)
                    }
                    style={styles.deleteButton}
                >
                    🗑 Delete
                </button>

            </div>

        </div>
    );
}


// =====================================================
// MAIN KANBAN BOARD
// =====================================================

function KanbanBoard() {

    const [tasks, setTasks] =
        useState([]);

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [connected, setConnected] =
        useState(false);

    const [editingTask, setEditingTask] =
        useState(null);

    const [editTitle, setEditTitle] =
        useState("");

    const [editDescription, setEditDescription] =
        useState("");


    const token =
        localStorage.getItem("token");


    const headers = {
        Authorization: `Bearer ${token}`
    };


    // =====================================================
    // LOAD TASKS
    // =====================================================

    const loadTasks = async () => {

        try {

            const response =
                await api.get(
                    "/tasks",
                    {
                        headers
                    }
                );

            setTasks(response.data);

        } catch (error) {

            console.error(
                "Failed to load tasks:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // =====================================================
    // SOCKET.IO
    // =====================================================

    useEffect(() => {

        loadTasks();


        const handleTaskCreated =
            (task) => {

                console.log(
                    "Socket: task created",
                    task
                );

                setTasks((current) => {

                    const exists =
                        current.some(
                            (item) =>
                                item.id ===
                                task.id
                        );

                    if (exists) {
                        return current;
                    }

                    return [
                        task,
                        ...current
                    ];

                });

            };


        const handleTaskUpdated =
            (task) => {

                console.log(
                    "Socket: task updated",
                    task
                );

                setTasks((current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            task.id
                                ? task
                                : item
                    )
                );

            };


        const handleTaskDeleted =
            ({ id }) => {

                console.log(
                    "Socket: task deleted",
                    id
                );

                setTasks((current) =>
                    current.filter(
                        (item) =>
                            item.id !== id
                    )
                );

            };


        const handleConnect = () => {

            console.log(
                "Socket connected:",
                socket.id
            );

            setConnected(true);

        };


        const handleDisconnect = () => {

            console.log(
                "Socket disconnected"
            );

            setConnected(false);

        };


        socket.on(
            "connect",
            handleConnect
        );

        socket.on(
            "disconnect",
            handleDisconnect
        );

        socket.on(
            "task:created",
            handleTaskCreated
        );

        socket.on(
            "task:updated",
            handleTaskUpdated
        );

        socket.on(
            "task:deleted",
            handleTaskDeleted
        );


        socket.connect();


        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "task:created",
                handleTaskCreated
            );

            socket.off(
                "task:updated",
                handleTaskUpdated
            );

            socket.off(
                "task:deleted",
                handleTaskDeleted
            );

            socket.disconnect();

        };

    }, []);


    // =====================================================
    // CREATE TASK
    // =====================================================

    const createTask = async (event) => {

        event.preventDefault();


        if (!title.trim()) {

            alert(
                "Please enter a task title."
            );

            return;

        }


        try {

            await api.post(
                "/tasks",
                {
                    title:
                        title.trim(),

                    description:
                        description.trim(),

                    status:
                        "todo",

                    assigned_to:
                        null
                },
                {
                    headers
                }
            );


            setTitle("");

            setDescription("");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to create task"
            );

        }

    };


    // =====================================================
    // DELETE TASK
    // =====================================================

    const deleteTask = async (id) => {

        if (
            !window.confirm(
                "Are you sure you want to delete this task?"
            )
        ) {
            return;
        }


        try {

            await api.delete(
                `/tasks/${id}`,
                {
                    headers
                }
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to delete task"
            );

        }

    };


    // =====================================================
    // OPEN EDIT MODAL
    // =====================================================

    const editTask = (task) => {

        setEditingTask(task);

        setEditTitle(
            task.title
        );

        setEditDescription(
            task.description || ""
        );

    };


    // =====================================================
    // SAVE EDIT
    // =====================================================

    const saveEdit = async (event) => {

        event.preventDefault();


        if (!editTitle.trim()) {

            alert(
                "Task title is required."
            );

            return;

        }


        try {

            await api.put(
                `/tasks/${editingTask.id}`,
                {
                    title:
                        editTitle.trim(),

                    description:
                        editDescription.trim(),

                    status:
                        editingTask.status,

                    assigned_to:
                        editingTask.assigned_to ||
                        null
                },
                {
                    headers
                }
            );


            setEditingTask(null);

            setEditTitle("");

            setEditDescription("");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to update task"
            );

        }

    };


    // =====================================================
    // DRAG & DROP
    // =====================================================

    const handleDragEnd =
        async (event) => {

            const {
                active,
                over
            } = event;


            if (!over) {
                return;
            }


            const taskId =
                Number(active.id);

            const newStatus =
                over.id;


            const task =
                tasks.find(
                    (item) =>
                        item.id === taskId
                );


            if (!task) {
                return;
            }


            if (
                !columns.some(
                    (column) =>
                        column.id ===
                        newStatus
                )
            ) {
                return;
            }


            if (
                task.status ===
                newStatus
            ) {
                return;
            }


            // Optimistic UI update

            setTasks((current) =>
                current.map(
                    (item) =>
                        item.id === taskId
                            ? {
                                ...item,
                                status:
                                    newStatus
                            }
                            : item
                )
            );


            try {

                await api.put(
                    `/tasks/${taskId}`,
                    {
                        title:
                            task.title,

                        description:
                            task.description ||
                            "",

                        status:
                            newStatus,

                        assigned_to:
                            task.assigned_to ||
                            null
                    },
                    {
                        headers
                    }
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Failed to move task"
                );

                loadTasks();

            }

        };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        window.location.reload();

    };


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {

        return (

            <div style={styles.loadingPage}>

                <div style={styles.loadingIcon}>
                    ⚡
                </div>

                <h2 style={styles.loadingTitle}>
                    Loading Command Center...
                </h2>

                <p style={styles.loadingText}>
                    Connecting to your workspace
                </p>

            </div>

        );

    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (

        <div style={styles.page}>

            {/* =================================================
                HEADER
            ================================================= */}

            <header style={styles.header}>

                <div>

                    <div style={styles.logoRow}>

                        <div style={styles.logo}>
                            ⚡
                        </div>

                        <h1 style={styles.heading}>
                            Command Center
                        </h1>

                    </div>

                    <p style={styles.subtitle}>
                        Real-time collaborative
                        task management
                    </p>

                </div>


                <div style={styles.headerRight}>

                    <div
                        style={{
                            ...styles.connectionBadge,

                            backgroundColor:
                                connected
                                    ? "#ecfdf5"
                                    : "#fef2f2",

                            color:
                                connected
                                    ? "#059669"
                                    : "#dc2626"
                        }}
                    >

                        <span
                            style={{
                                ...styles.connectionDot,

                                backgroundColor:
                                    connected
                                        ? "#10b981"
                                        : "#ef4444"
                            }}
                        />

                        {connected
                            ? "Live"
                            : "Offline"}

                    </div>


                    <button
                        onClick={logout}
                        style={styles.logoutButton}
                    >
                        Logout
                    </button>

                </div>

            </header>


            {/* =================================================
                CREATE TASK
            ================================================= */}

            <section style={styles.createSection}>

                <div style={styles.createHeader}>

                    <h2 style={styles.createTitle}>
                        Create New Task
                    </h2>

                    <p style={styles.createSubtitle}>
                        Add a task to your
                        collaborative board
                    </p>

                </div>


                <form
                    onSubmit={createTask}
                    style={styles.form}
                >

                    <input
                        value={title}
                        onChange={(event) =>
                            setTitle(
                                event.target.value
                            )
                        }
                        placeholder="Task title"
                        style={styles.input}
                    />


                    <input
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value
                            )
                        }
                        placeholder="Task description"
                        style={styles.input}
                    />


                    <button
                        type="submit"
                        style={styles.addButton}
                    >
                        + Add Task
                    </button>

                </form>

            </section>


            {/* =================================================
                WORKSPACE HEADING
            ================================================= */}

            <div style={styles.boardHeading}>

                <h2 style={styles.boardTitle}>
                    Your Workspace
                </h2>

                <p style={styles.boardSubtitle}>
                    Drag tasks between columns
                    to update their status
                </p>

                <div style={styles.taskTotal}>
                    {tasks.length}{" "}
                    {tasks.length === 1
                        ? "Task"
                        : "Tasks"}
                </div>

            </div>


            {/* =================================================
                KANBAN BOARD
            ================================================= */}

            <DndContext
                onDragEnd={handleDragEnd}
            >

                <div style={styles.board}>

                    {columns.map(
                        (column) => (

                            <KanbanColumn
                                key={column.id}
                                column={column}
                                tasks={tasks.filter(
                                    (task) =>
                                        task.status ===
                                        column.id
                                )}
                                onDelete={
                                    deleteTask
                                }
                                onEdit={
                                    editTask
                                }
                            />

                        )
                    )}

                </div>

            </DndContext>


            {/* =================================================
                EDIT MODAL
            ================================================= */}

            {editingTask && (

                <div style={styles.modalOverlay}>

                    <form
                        onSubmit={saveEdit}
                        style={styles.modal}
                    >

                        <div style={styles.modalHeader}>

                            <div>

                                <h2 style={styles.modalTitle}>
                                    Edit Task
                                </h2>

                                <p style={styles.modalSubtitle}>
                                    Update task details
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setEditingTask(null)
                                }
                                style={styles.closeButton}
                            >
                                ×
                            </button>

                        </div>


                        <label style={styles.label}>
                            Task Title
                        </label>

                        <input
                            value={editTitle}
                            onChange={(event) =>
                                setEditTitle(
                                    event.target.value
                                )
                            }
                            style={styles.modalInput}
                            autoFocus
                        />


                        <label style={styles.label}>
                            Description
                        </label>

                        <textarea
                            value={editDescription}
                            onChange={(event) =>
                                setEditDescription(
                                    event.target.value
                                )
                            }
                            style={styles.textarea}
                            rows="4"
                        />


                        <div style={styles.modalActions}>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingTask(null)
                                }
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                style={styles.saveButton}
                            >
                                Save Changes
                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>

    );
}


// =====================================================
// STYLES
// =====================================================

const styles = {

    page: {
        minHeight: "100vh",
        background:
            "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        padding: "32px",
        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#0f172a",
        boxSizing: "border-box"
    },


    // =================================================
    // HEADER
    // =================================================

    header: {
        maxWidth: "1350px",
        margin: "0 auto 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },


    logoRow: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    logo: {
        width: "46px",
        height: "46px",
        borderRadius: "12px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        boxShadow:
            "0 8px 20px rgba(79, 70, 229, 0.25)"
    },


    heading: {
        margin: 0,
        fontSize: "30px",
        fontWeight: "800",
        letterSpacing: "-0.8px"
    },


    subtitle: {
        margin: "6px 0 0 58px",
        color: "#64748b",
        fontSize: "15px"
    },


    headerRight: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },


    connectionBadge: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "9px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "700"
    },


    connectionDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%"
    },


    logoutButton: {
        border: "none",
        padding: "10px 18px",
        borderRadius: "9px",
        backgroundColor: "#0f172a",
        color: "white",
        cursor: "pointer",
        fontWeight: "600"
    },


    // =================================================
    // CREATE TASK
    // =================================================

    createSection: {
        maxWidth: "1350px",
        margin: "0 auto 34px",
        backgroundColor: "white",
        borderRadius: "18px",
        padding: "24px",
        border: "1px solid #e2e8f0",
        boxShadow:
            "0 8px 30px rgba(15, 23, 42, 0.06)"
    },


    createHeader: {
        textAlign: "center",
        marginBottom: "22px"
    },


    createTitle: {
        margin: 0,
        fontSize: "22px",
        fontWeight: "800"
    },


    createSubtitle: {
        margin: "6px 0 0",
        color: "#64748b",
        fontSize: "14px"
    },


    form: {
        display: "grid",
        gridTemplateColumns:
            "1fr 1.5fr auto",
        gap: "12px"
    },


    input: {
        width: "100%",
        boxSizing: "border-box",
        padding: "13px 15px",
        border: "1px solid #cbd5e1",
        borderRadius: "10px",
        outline: "none",
        fontSize: "14px",
        backgroundColor: "#f8fafc"
    },


    addButton: {
        padding: "13px 22px",
        border: "none",
        borderRadius: "10px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        cursor: "pointer",
        fontWeight: "700",
        whiteSpace: "nowrap",
        boxShadow:
            "0 6px 15px rgba(79, 70, 229, 0.2)"
    },


    // =================================================
    // CENTERED WORKSPACE HEADING
    // =================================================

    boardHeading: {
        maxWidth: "1350px",
        margin: "0 auto 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "8px"
    },


    boardTitle: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a",
        letterSpacing: "-0.5px"
    },


    boardSubtitle: {
        margin: 0,
        color: "#64748b",
        fontSize: "15px"
    },


    taskTotal: {
        marginTop: "6px",
        padding: "8px 16px",
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#475569"
    },


    // =================================================
    // BOARD
    // =================================================

    board: {
        maxWidth: "1350px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns:
            "repeat(3, minmax(280px, 1fr))",
        gap: "20px",
        alignItems: "start"
    },


    // =================================================
    // COLUMN
    // =================================================

    column: {
        minHeight: "520px",
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        transition:
            "all 0.2s ease",
        boxSizing: "border-box"
    },


    columnHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "18px"
    },


    columnTitleWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "10px"
    },


    columnIcon: {
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "15px"
    },


    columnTitle: {
        margin: 0,
        fontSize: "16px",
        fontWeight: "750"
    },


    count: {
        minWidth: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: "750",
        color: "#475569",
        border: "1px solid #e2e8f0"
    },


    // =================================================
    // EMPTY STATE
    // =================================================

    emptyState: {
        minHeight: "350px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
    },


    emptyIcon: {
        width: "54px",
        height: "54px",
        borderRadius: "50%",
        backgroundColor:
            "rgba(255,255,255,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        marginBottom: "12px"
    },


    emptyTitle: {
        margin: 0,
        fontWeight: "700",
        color: "#64748b"
    },


    emptyText: {
        margin: "6px 0",
        fontSize: "12px",
        color: "#94a3b8"
    },


    // =================================================
    // TASK CARD
    // =================================================

    card: {
        backgroundColor: "white",
        padding: "17px",
        marginBottom: "12px",
        borderRadius: "13px",
        border: "1px solid #e2e8f0",
        cursor: "grab",
        transition:
            "box-shadow 0.2s ease, border-color 0.2s ease",
        touchAction: "none"
    },


    taskHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "10px"
    },


    taskTitle: {
        margin: 0,
        fontSize: "15px",
        fontWeight: "750",
        lineHeight: "1.4",
        color: "#0f172a"
    },


    statusDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        flexShrink: 0,
        marginTop: "5px"
    },


    description: {
        margin: "9px 0",
        fontSize: "13px",
        lineHeight: "1.5",
        color: "#64748b"
    },


    assignedUser: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "10px"
    },


    userIcon: {
        fontSize: "12px"
    },


    statusBadge: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "700",
        marginBottom: "12px"
    },


    actions: {
        display: "flex",
        gap: "8px",
        borderTop: "1px solid #f1f5f9",
        paddingTop: "12px"
    },


    editButton: {
        flex: 1,
        border: "1px solid #c7d2fe",
        backgroundColor: "#eef2ff",
        color: "#4338ca",
        padding: "8px 10px",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "650"
    },


    deleteButton: {
        flex: 1,
        border: "1px solid #fecaca",
        backgroundColor: "#fef2f2",
        color: "#dc2626",
        padding: "8px 10px",
        borderRadius: "7px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "650"
    },


    // =================================================
    // EDIT MODAL
    // =================================================

    modalOverlay: {
        position: "fixed",
        inset: 0,
        backgroundColor:
            "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 1000
    },


    modal: {
        width: "100%",
        maxWidth: "520px",
        backgroundColor: "white",
        borderRadius: "18px",
        padding: "26px",
        boxShadow:
            "0 25px 70px rgba(15, 23, 42, 0.25)",
        boxSizing: "border-box"
    },


    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px"
    },


    modalTitle: {
        margin: 0,
        fontSize: "21px",
        fontWeight: "750"
    },


    modalSubtitle: {
        margin: "5px 0 0",
        color: "#64748b",
        fontSize: "13px"
    },


    closeButton: {
        border: "none",
        backgroundColor: "#f1f5f9",
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        fontSize: "23px",
        lineHeight: "1",
        cursor: "pointer",
        color: "#475569"
    },


    label: {
        display: "block",
        marginBottom: "7px",
        marginTop: "15px",
        fontSize: "13px",
        fontWeight: "700",
        color: "#334155"
    },


    modalInput: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        outline: "none",
        fontSize: "14px"
    },


    textarea: {
        width: "100%",
        boxSizing: "border-box",
        padding: "12px 13px",
        border: "1px solid #cbd5e1",
        borderRadius: "9px",
        outline: "none",
        fontSize: "14px",
        resize: "vertical",
        fontFamily: "inherit"
    },


    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "24px"
    },


    cancelButton: {
        padding: "10px 18px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        backgroundColor: "white",
        color: "#475569",
        cursor: "pointer",
        fontWeight: "600"
    },


    saveButton: {
        padding: "10px 20px",
        border: "none",
        borderRadius: "8px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        cursor: "pointer",
        fontWeight: "700"
    },


    // =================================================
    // LOADING
    // =================================================

    loadingPage: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
            "linear-gradient(135deg, #f8fafc, #eef2ff)",
        color: "#0f172a"
    },


    loadingIcon: {
        width: "58px",
        height: "58px",
        borderRadius: "16px",
        background:
            "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "25px",
        marginBottom: "18px",
        boxShadow:
            "0 10px 25px rgba(79, 70, 229, 0.25)"
    },


    loadingTitle: {
        margin: 0,
        fontSize: "20px"
    },


    loadingText: {
        marginTop: "7px",
        color: "#64748b",
        fontSize: "14px"
    }

};


export default KanbanBoard;