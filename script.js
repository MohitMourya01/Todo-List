// script.js
$(document).ready(function () {
    let tasks = [];

     // Load tasks from local storage
     function loadTasks() {
        let storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            renderTasks(); // Render tasks from local storage
        }
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function renderTasks() {
        $('#task-list').empty(); // Clear the current list

        tasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)); // Sort by deadline

        tasks.forEach(task => {
            let taskItem = $('<li></li>').text(task.text);
            let deleteButton = $('<button></button>').html('<i class="fas fa-trash-alt"></i>');

            if (task.deadline) {
                let deadlineSpan = $('<span></span>').addClass('deadline').text('Due: ' + new Date(task.deadline).toLocaleString());
                let countdownSpan = $('<span></span>').addClass('countdown').text('');
                taskItem.append(deadlineSpan).append(countdownSpan);
            }

            // Mark task as completed on click
            taskItem.click(function () {
                $(this).toggleClass('completed');
            });

            // Delete task on button click
            deleteButton.click(function () {
                tasks = tasks.filter(t => t !== task);
                saveTasks(); //save task to local storage
                renderTasks();
            });

            taskItem.append(deleteButton);
            $('#task-list').append(taskItem);
        });
    }

    function showNotification(task) {
        if (Notification.permission === "granted") {
            new Notification(`Task "${task.text}" is due!`, {
                body: `The deadline for "${task.text}" has passed!`,
                icon: 'notification_icon.png' // You can add a custom icon
            });
        } else {
            alert(`Task "${task.text}" deadline has passed!`);
        }
    }

    function updateCountdowns() {
        let now = new Date();

        tasks.forEach(task => {
            if (task.deadline) {
                let deadlineDate = new Date(task.deadline);
                let timeDiff = deadlineDate - now;

                if (timeDiff <= 0 && !task.notified) {
                    showNotification(task);
                    task.notified = true; // Prevent multiple notifications

                    $('#task-list li').each(function (index) {
                        if (tasks[index].text === task.text && tasks[index].deadline === task.deadline) {
                            $(this).find('.countdown').text("Time's up!");
                            $(this).addClass('overdue'); // Add a CSS class for overdue tasks
                        }
                    });
                } else if (timeDiff > 0) {
                    let hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                    let countdownText = `Time left: ${hours}h ${minutes}m ${seconds}s`;

                    // Find the corresponding countdown span and update it
                    $('#task-list li').each(function (index) {
                        if (tasks[index].text === task.text && tasks[index].deadline === task.deadline) {
                            $(this).find('.countdown').text(countdownText);

                            if (timeDiff < 300000) { // Less than 5 minutes left
                                $(this).addClass('urgent'); // Add a CSS class for urgent tasks
                            }
                        }
                    });
                }
            }
        });
    }

    // Add a new task with a deadline
    $('#add-task').click(function () {
        let taskText = $('#new-task').val().trim();
        let taskDeadline = $('#task-deadline').val();
        //console.log(taskDeadline)

        if (taskText !== "") {
            let newTask = {
                text: taskText,
                deadline: taskDeadline,
                notified: false // Initialize notified flag
            };
            tasks.push(newTask); // Add task to the array
            saveTasks(); // save tasks to local storage
            renderTasks(); // Re-render the sorted task list

            $('#new-task').val(''); // Clear input field
            $('#task-deadline').val(''); // Clear deadline field
        }
    });

    // Allow pressing 'Enter' to add task
    $('#new-task').keypress(function (e) {
        if (e.which === 13) { // Enter key
            $('#add-task').click();
        }
    });

    // Request permission for notifications
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

      // Load tasks from local storage on page load
      loadTasks();

    // Update countdown every second
    setInterval(updateCountdowns, 1000);
});
