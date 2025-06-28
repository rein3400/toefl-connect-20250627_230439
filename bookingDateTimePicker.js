export default class BookingDateTimePicker {
  constructor(dateInput, timeSelect, availability = {}, onChange = null) {
    this.dateInput = dateInput;
    this.timeSelect = timeSelect;
    this.availability = availability;
    this.selectedDate = '';
    this.selectedTime = '';
    this.onChange = onChange;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.dateInput.min = `${yyyy}-${mm}-${dd}`;

    this.timeSelect.options.length = 0;
    this.timeSelect.disabled = true;
    this.timeSelect.setAttribute('aria-disabled', 'true');
    this._addOption(this.timeSelect, '', 'Select date first');

    this.dateInput.addEventListener('change', this._onDateChange.bind(this));
    this.timeSelect.addEventListener('change', this._onTimeChange.bind(this));
  }

  _onDateChange(e) {
    this.selectedDate = e.target.value;
    this.selectedTime = '';
    this.timeSelect.value = '';
    this._populateTimes(this.selectedDate);
  }

  _populateTimes(date) {
    this.timeSelect.options.length = 0;
    const times = this.availability[date] || [];
    if (times.length) {
      this.timeSelect.disabled = false;
      this.timeSelect.removeAttribute('aria-disabled');
      this._addOption(this.timeSelect, '', 'Select time');
      times.forEach(t => this._addOption(this.timeSelect, t, t));
    } else {
      this.timeSelect.disabled = true;
      this.timeSelect.setAttribute('aria-disabled', 'true');
      this._addOption(this.timeSelect, '', 'No available times');
    }
  }

  _addOption(select, value, text) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = text;
    select.appendChild(opt);
  }

  _onTimeChange(e) {
    this.selectedTime = e.target.value;
    if (this.selectedDate && this.selectedTime) {
      const [year, month, day] = this.selectedDate.split('-').map(n => parseInt(n, 10));
      const [hour, minute] = this.selectedTime.split(':').map(n => parseInt(n, 10));
      const dateObj = new Date(year, month - 1, day, hour, minute);
      if (typeof this.onChange === 'function') {
        this.onChange(dateObj);
      }
    }
  }

  getValue() {
    if (this.selectedDate && this.selectedTime) {
      const [year, month, day] = this.selectedDate.split('-').map(n => parseInt(n, 10));
      const [hour, minute] = this.selectedTime.split(':').map(n => parseInt(n, 10));
      return new Date(year, month - 1, day, hour, minute);
    }
    return null;
  }

  setAvailability(availability) {
    this.availability = availability;
    if (this.selectedDate) {
      this._populateTimes(this.selectedDate);
    }
  }
}