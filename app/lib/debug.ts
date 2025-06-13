// Debug utilities for the application

/**
 * Wraps a form submission to log the form data before submission
 * @param event The form submission event
 */
export function logFormSubmission(event: React.FormEvent<HTMLFormElement>) {
  // Get the form data
  const formData = new FormData(event.currentTarget);
  
  // Log all form entries
  console.log("Form submission data:");
  Array.from(formData.entries()).forEach(([key, value]) => {
    console.log(`${key}:`, value);
  });
  
  // Log specific array values
  const sizes = formData.getAll('sizes');
  const colors = formData.getAll('colors');
  const images = formData.getAll('images');
  
  console.log("Form arrays:");
  console.log("- sizes:", sizes);
  console.log("- colors:", colors);
  console.log("- images:", images);
}
