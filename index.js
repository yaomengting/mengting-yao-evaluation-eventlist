const eventsAPIs = (function () {
  const API_URL = "http://localhost:3000/events";

  async function getEvents() {
    return fetch(API_URL).then((res) => res.json());
  }

  async function addEvent(newEvent) {
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newEvent),
    }).then((res) => res.json());
  }

  async function deleteEvent(id) {
    return fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  }

  async function patchEvent(id, updatedEventData) {
    return fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedEventData),
    }).then((res) => res.json());
  }

  return {
    getEvents,
    addEvent,
    deleteEvent,
    patchEvent
  };

})();

class EventsView {
  constructor() {
    this.addEventButton = document.querySelector("#addEventButton");
    this.eventList = document.querySelector(".event-list");
  }

  renderEvents(events) {
    this.eventList.innerHTML = "";
    events.forEach((event) => {
      this.renderNewEvent(event);
    })
  }

  renderNewEvent(newEvent) {
    this.eventList.appendChild(this.createEventElement(newEvent));
  }

  createEventElement(event) {
    const eventElement = document.createElement("tr");
    eventElement.classList.add("event");
    eventElement.setAttribute("id", event.id);
    eventElement.innerHTML = `
    <td>
      <span class="event-name-text">${event.eventName}</span>
      <input class="event-name-input" value="${event.eventName}" style="display: none;">
    </td>
    <td>
      <span class="start-date-text">${event.startDate}</span>
      <input type="date" class="start-date-input" value="${event.startDate}" style="display: none;">
    </td>
    <td>
      <span class="end-date-text">${event.endDate}</span>
      <input type="date" class="end-date-input" value="${event.endDate}" style="display: none;">
    </td>
    <td>
      <button class="edit-event-btn">Edit</button>
      <button class="save-event-btn" style="display: none;">Save</button>
      <button class="delete-event-btn">Delete</button>
    </td>
    `;
    return eventElement;
  }

  removeEvent(id) {
    document.getElementById(id).remove();
  }
}

class EventsModel {
  #events;
  constructor(events = []) {
    this.#events = events;
  }

  getEvents() {
    return this.#events;
  }

  setEvents(newEvents) {
    this.#events = newEvents;
  }

  addEvent(newEvent) {
    this.#events.push(newEvent);
  }

  deleteEvent(id) {
    this.#events = this.#events.filter((event) => event.id !== id);
  }
}

class EventsController {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.init();
  }

  init() {
    this.setUpEvents();
    this.fetchEvents();
  }

  setUpEvents() {
    this.setUpCickEvent();
    this.setUpDeleteEvent();
    this.setUpEditEvent();
    this.setUpSaveEvent();
  }

  async fetchEvents() {
    const events = await eventsAPIs.getEvents();
    this.model.setEvents(events);
    this.view.renderEvents(events);
  }

  setUpCickEvent() {
    this.view.addEventButton.addEventListener("click", async () => {
      const newEventElement = document.createElement("tr");
      newEventElement.innerHTML = `
      <td><input class="new-event-name"></td
      <td><input type="date" class="new-event-start-date"></td>
      <td><input type="date" class="new-event-end-date"></td>
      <td><button class="save-new-event">Save</button></td>
      `;
      this.view.eventList.appendChild(newEventElement);

      const saveButton = newEventElement.querySelector(".save-new-event");
      saveButton.addEventListener("click", async () => {
        const eventNameInput = newEventElement.querySelector(".new-event-name");
        const startDateInput = newEventElement.querySelector(".new-event-start-date");
        const endDateInput = newEventElement.querySelector(".new-event-end-date");

        const eventName = eventNameInput.value.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!eventName || !startDate || !endDate) {
          alert("Input Not Valid!");
          return;
        };
        const newEvent = await eventsAPIs.addEvent({ eventName, startDate, endDate });
        this.model.addEvent(newEvent);
        this.view.renderNewEvent(newEvent);
        newEventElement.remove();
      })
    })


  }

  setUpDeleteEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      const elem = e.target;
      if (elem.classList.contains("delete-event-btn")) {
        const eventElem = elem.closest('tr');
        const deleteId = eventElem.getAttribute('id');
        await eventsAPIs.deleteEvent(deleteId);
        this.model.deleteEvent(deleteId);
        this.view.removeEvent(deleteId);
      }
    })

  }

  setUpEditEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      const elem = e.target;
      if (elem.classList.contains('edit-event-btn')) {
        const eventElem = elem.closest("tr");

        const eventNameText = eventElem.querySelector('.event-name-text');
        const eventNameInput = eventElem.querySelector('.event-name-input');
        eventNameText.style.display = 'none';
        eventNameInput.style.display = '';

        const startDateText = eventElem.querySelector('.start-date-text');
        const startDateInput = eventElem.querySelector('.start-date-input');
        startDateText.style.display = 'none';
        startDateInput.style.display = '';

        const endDateText = eventElem.querySelector('.end-date-text');
        const endDateInput = eventElem.querySelector('.end-date-input');
        endDateText.style.display = 'none';
        endDateInput.style.display = '';

        eventElem.querySelector('.save-event-btn').style.display = '';
        // elem.style.display = 'none';
        e.target.style.display = 'none';
      }
    })
  }

  setUpSaveEvent() {
    this.view.eventList.addEventListener("click", async (e) => {
      const elem = e.target;
      if (elem.classList.contains('save-event-btn')) {
        const eventElem = elem.closest("tr");
        const eventId = eventElem.getAttribute("id");
        const input = eventElem.querySelector("input");
        const updatedName = input.value.trim();
        if (!updatedName) return;
        await eventsAPIs.patchEvent(eventId, {
          eventName: updatedName
        })
        const eventNameText = document.createElement('span');
        eventNameText.className = 'event-name-text';
        eventNameText.textContent = updatedName;
        input.parentNode.replaceChild(eventNameText, input);
        elem.style.display = 'none';
      }
    })
  }
}

const eventsView = new EventsView();
const eventsModel = new EventsModel();
const eventController = new EventsController(eventsView, eventsModel);