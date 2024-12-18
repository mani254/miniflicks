class CalendarLogic {
   constructor(year = new Date().getFullYear(), month = new Date().getMonth(), unavailable = [], selectedDate = null) {
      this.year = year;
      this.month = month;
      this.unavailable = unavailable;
      this.selectedDate = selectedDate instanceof Date ? selectedDate : null;
   }

   daysInMonth() {
      return new Date(this.year, this.month + 1, 0).getDate();
   }

   generateCalendar() {
      const firstDay = new Date(this.year, this.month, 1).getDay();
      const totalDays = this.daysInMonth();
      const calendar = [];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let date = 1;
      for (let i = 0; i < 6; i++) {
         const week = [];
         for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
               week.push(null);
            } else if (date > totalDays) {
               week.push(null);
            } else {
               const currentDate = new Date(this.year, this.month, date);
               const isUnavailable = this.unavailable.includes(currentDate.getTime()) || currentDate < yesterday;
               const isSelected =
                  this.selectedDate &&
                  currentDate.getDate() === this.selectedDate.getDate() &&
                  currentDate.getMonth() === this.selectedDate.getMonth() &&
                  currentDate.getFullYear() === this.selectedDate.getFullYear();

               week.push({
                  date: currentDate,
                  unavailable: isUnavailable,
                  selected: isSelected,
               });
               date++;
            }
         }
         calendar.push(week);
      }
      return calendar;
   }

   handleMonthChange(increment) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Prevent moving to a month earlier than the current month and year
      if (
         this.year < currentYear ||
         (this.year === currentYear && this.month <= currentMonth && increment < 0)
      ) {
         return;
      }

      this.month += increment;
      if (this.month < 0) {
         this.month = 11;
         this.year -= 1;
      } else if (this.month > 11) {
         this.month = 0;
         this.year += 1;
      }

      // After updating, check again if it's going too far back
      if (this.year < currentYear || (this.year === currentYear && this.month < currentMonth)) {
         this.year = currentYear;
         this.month = currentMonth;
      }
   }

   handleYearChange(increment) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Prevent moving to a year earlier than the current year
      if (this.year <= currentYear) {
         this.year += increment;
      }
   }
}

export default CalendarLogic;
