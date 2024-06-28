export default function validateField(fieldName, value) {
   let errorMessage = '';
   switch (fieldName) {
      case 'name':
         if (!value || value.length < 3 || value.length > 40) {
            errorMessage = 'Name must be between 3 and 40 characters';
         }
         break;
      case 'address':
         if (!value || value.length < 5 || value.length > 100) {
            errorMessage = 'Address must be between 5 and 100 characters';
         }
         break;
      case 'location':
         const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
         if (!urlPattern.test(value)) {
            errorMessage = 'Please enter a valid URL';
         }
         break;
      default:
         break;
   }
   return errorMessage;
}
