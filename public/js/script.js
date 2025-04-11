// Generic function to handle button loading states
function setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('is-loading');
      button.disabled = true;
    } else {
      button.classList.remove('is-loading');
      button.disabled = false;
    }
  }
  
  // Example usage for form submission
  document.querySelector('#registrationForm').addEventListener('submit', function(e) {
    const submitButton = this.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);
    
    // Simulate async operation (replace with your actual form submission)
    setTimeout(() => {
      setButtonLoading(submitButton, false);
    }, 2000);
  });
  
  // Example usage for voting button
  document.querySelector('#voteButton').addEventListener('click', function() {
    setButtonLoading(this, true);
    
    // Simulate async voting operation
    setTimeout(() => {
      setButtonLoading(this, false);
      alert('Vote submitted!');
    }, 1500);
  });