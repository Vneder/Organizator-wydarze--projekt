class EventStorageManager {
    // Wczytywanie wydarzeń ze storage
    static loadEvents() {
        const storedEvents = localStorage.getItem('events');
        return storedEvents ? JSON.parse(storedEvents) : [];
    }

    // Zapisywanie wydarzeń do storage
    static saveEvents(events) {
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Wczytywanie sortowania ze storage
    static loadSortOrder() {
        const sortOrder = localStorage.getItem('sortOrder');
        return sortOrder || 'oldest';
    }

    // Zapisywania sortowania do storage
    static saveSortOrder(sortOrder) {
        localStorage.setItem('sortOrder', sortOrder);
    }
}

class FormManager {
    constructor(eventOrganizer) {
        this.eventOrganizer = eventOrganizer;
        this.initializeForm();
    }

    // Inicjalizacja formularza
    initializeForm() {
        const form = document.querySelector('.event-form');
        form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    handleFormSubmit(event) {
        event.preventDefault();

        // Pobieranie pól z formularza
        const eventName = document.querySelector('.event-name').value;
        const eventDate = document.querySelector('.event-date').value;
        const eventTime = document.querySelector('.event-time').value;
        const eventLocation = document.querySelector('.event-location').value;
        const eventDescription = document.querySelector('.event-description').value;

        if (this.eventOrganizer.editingEvent) {
            // Aktualizacja wydarzenia
            this.eventOrganizer.editingEvent.name = eventName;
            this.eventOrganizer.editingEvent.date = eventDate;
            this.eventOrganizer.editingEvent.time = eventTime;
            this.eventOrganizer.editingEvent.location = eventLocation;
            this.eventOrganizer.editingEvent.description = eventDescription;
            this.eventOrganizer.saveEvents();
            this.eventOrganizer.resetForm();
        } else {
            // Dodawanie wydarzenia (Tworzenie obiektu)
            const event = {
                id: Date.now(),
                name: eventName,
                date: eventDate,
                time: eventTime,
                location: eventLocation,
                description: eventDescription,
            };
            this.eventOrganizer.addEvent(event);
        }

        this.eventOrganizer.displayEvents();
    }
}

class EventManager {
    constructor() {
        this.events = EventStorageManager.loadEvents();
        this.sortOrder = EventStorageManager.loadSortOrder();
        this.editingEvent = null;
        this.initializeComponents();
        this.displayEvents();
    }

    // Inicjalizacja komponentów
    initializeComponents() {
        this.formManager = new FormManager(this);
        this.initializeSortButtons();
        this.initializeSearchInput();
    }

    // Zapisywanie wydarzeń do storage
    saveEvents() {
        EventStorageManager.saveEvents(this.events);
    }

    // Dodawanie wydarzenia
    addEvent(event) {
        this.events.push(event);
        this.saveEvents();
    }

    // Resetowanie formularza
    resetForm() {
        const form = document.querySelector('.event-form');
        form.reset();
        this.editingEvent = null;
    }

    // Wyświetlanie wydarzeń
    displayEvents() {
        const table = document.querySelector('.event-table');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        this.sortEvents();

        this.events.forEach((event) => {
            const row = table.insertRow();
            row.id = 'event-row-' + event.id;

            const nameCell = row.insertCell();
            nameCell.innerHTML = event.name;

            const dateCell = row.insertCell();
            dateCell.innerHTML = event.date;

            const timeCell = row.insertCell();
            timeCell.innerHTML = event.time;

            const locationCell = row.insertCell();
            locationCell.innerHTML = event.location;

            const descriptionCell = row.insertCell();
            descriptionCell.innerHTML = event.description;

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.innerHTML = 'Edytuj';
            editButton.addEventListener('click', () => {
                this.editEvent(event);
            });
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Usuń';
            deleteButton.addEventListener('click', () => {
                this.deleteEvent(event);
            });
            actionsCell.appendChild(deleteButton);
        });
    }

    // Edycja wydarzenia
    editEvent(event) {
        document.querySelector('.event-name').value = event.name;
        document.querySelector('.event-date').value = event.date;
        document.querySelector('.event-time').value = event.time;
        document.querySelector('.event-location').value = event.location;
        document.querySelector('.event-description').value = event.description;

        this.editingEvent = event;
    }

    // Usuwanie wydarzenia
    deleteEvent(event) {
        const index = this.events.findIndex((e) => e.id === event.id);
        if (index !== -1) {
            this.events.splice(index, 1);
            this.saveEvents();
            this.displayEvents();
        }
    }

    // Inicjalizacja przycisków sortowania
    initializeSortButtons() {
        const oldestButton = document.querySelector('.sort-oldest-button');
        oldestButton.addEventListener('click', () => {
            this.sortOrder = 'oldest';
            this.sortEvents();
            EventStorageManager.saveSortOrder(this.sortOrder);
            this.displayEvents();
        });

        const newestButton = document.querySelector('.sort-newest-button');
        newestButton.addEventListener('click', () => {
            this.sortOrder = 'newest';
            this.sortEvents();
            EventStorageManager.saveSortOrder(this.sortOrder);
            this.displayEvents();
        });
    }

    // Sortowanie wydarzeń
    sortEvents() {
        this.events.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return this.sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
        });
    }

    // Inicjalizacja wyszukiwarki
    initializeSearchInput() {
        const searchInput = document.querySelector('.event-search');
        const searchButton = document.querySelector('.search-button');

        searchButton.addEventListener('click', () => {
            const searchQuery = searchInput.value.toLowerCase();
            const filteredEvents = this.events.filter((event) => {
                return event.name.toLowerCase().includes(searchQuery);
            });
            this.displayFilteredEvents(filteredEvents);
        });

        const clearSearchButton = document.querySelector('.clear-search-button');
        clearSearchButton.addEventListener('click', () => {
            searchInput.value = '';
            this.displayEvents();
        });
    }

    // Wyświetlanie przefiltrowanych wydarzeń
    displayFilteredEvents(events) {
        const table = document.querySelector('.event-table');
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        events.forEach((event) => {
            const row = table.insertRow();
            row.id = 'event-row-' + event.id;

            const nameCell = row.insertCell();
            nameCell.innerHTML = event.name;

            const dateCell = row.insertCell();
            dateCell.innerHTML = event.date;

            const timeCell = row.insertCell();
            timeCell.innerHTML = event.time;

            const locationCell = row.insertCell();
            locationCell.innerHTML = event.location;

            const descriptionCell = row.insertCell();
            descriptionCell.innerHTML = event.description;

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.innerHTML = 'Edytuj';
            editButton.addEventListener('click', () => {
                this.editEvent(event);
            });
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = 'Usuń';
            deleteButton.addEventListener('click', () => {
                this.deleteEvent(event);
            });
            actionsCell.appendChild(deleteButton);
        });
    }
}

new EventManager();
