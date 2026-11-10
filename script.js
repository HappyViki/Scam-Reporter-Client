const scamListApiUrl = "https://scam-reporter-api-production.up.railway.app/";

let allScams = [];
let currentPage = 1;
const pageSize = 10;
let searchQuery = '';


async function addScamItem() {
  // 1. Gather input values from the HTML form
  const inputScam = {
    ScamDescription: document.getElementById('scamDesc').value.trim(),
    PhoneNumber: document.getElementById('scamTel').value.trim(),
    EmailAddress: document.getElementById('scamEmail').value.trim(),
    Website: document.getElementById('scamSite').value.trim()
  };

  // 2. Validate mandatory fields before sending (optional but recommended)
  if (!inputScam.ScamDescription) {
    alert('Please enter a scam description.');
    return;
  }
  if (inputScam.ScamDescription.length > 1000) { //maybe higher
    alert('Description cannot exceed 1,000 characters.');
    return;
  }
  if (inputScam.PhoneNumber && inputScam.PhoneNumber.length > 15 && inputScam.PhoneNumber.length < 4) {
    alert('Phone number is invalid.');
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (inputScam.EmailAddress && (inputScam.EmailAddress > 100 || !emailRegex.test(inputScam.EmailAddress))) {
    alert('Email address is invalid.');
    return;
  }

  if (inputScam.Website) {
    try {
      const parsed = new URL(inputScam.Website);
      if (inputScam.Website.length > 256 || !(parsed.protocol === "http:" || parsed.protocol === "https:")) {
        alert('Website is invalid.');
        return;
      }
    } catch (err) {
      alert('Website is invalid.');
      return;
    }
  }


  try {
    // 3. Send the POST request to the server
    const response = await fetch(scamListApiUrl + 'scamitems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(inputScam) // Sends the object exactly how your backend expects it
    });

    // 4. Handle the server response
    if (response.ok) {
      const result = await response.json();
      alert('Scam item added successfully!');
      document.getElementById('scamForm').reset(); // Clear form after success
      getScamItems()

    } else { //error handling
      const contentType = response.headers.get("content-type");
      let errorMsg = response.statusText;
    
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMsg = errorData.message || JSON.stringify(errorData);
      } else {
        errorMsg = await response.text();
      }
      alert('Failed to add scam item: ${errorMsg}');
    }
  } catch (error) {
    console.error('Error submitting scam item:', error);
    alert('A network error occurred. Please try again.');
  }
}

document.getElementById('submitScam').addEventListener('click', addScamItem);



async function getScamItems() {
  try {
    const response = await fetch(scamListApiUrl + 'scamitems', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

    // Check if the network response was successful (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    allScams = await response.json();
    console.log(allScams);
    renderScams();
    return allScams;
    
  } catch (error) {
    console.error('Error fetching scam items:', error);
  }
}


//getScamItems helper
function renderScams() {
  scamList.innerHTML = '';

  const filteredScams = getFilteredScams();

  const totalPages = Math.ceil(filteredScams.length / pageSize) || 1;

  //page bounds check
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  //slice scam items for current page (10 per page rn)
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedScams = filteredScams.slice(startIndex, startIndex + pageSize);

  //update pagination controls
  document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage >= totalPages;

  if (paginatedScams.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.textContent = `No scams match your search query.`;
    scamList.appendChild(emptyMsg);
    return;
  }

  //render scam items
  paginatedScams.forEach(({scamDescription, phoneNumber, emailAddress, website}) => {
    const item = document.createElement('div');
    item.className = 'scamItem';

    const desc = document.createElement('div');
    desc.style.marginBottom = '8px';
    desc.textContent = scamDescription || ''; //description will be required
    item.appendChild(desc);

    const contactInfo = document.createElement('div');
    if (phoneNumber) {
      const phone = document.createElement('div');
      phone.textContent = `Phone: ${phoneNumber}`;
      contactInfo.appendChild(phone);
    }
    if (emailAddress) {
      const email = document.createElement('div');
      email.textContent = `Email: ${emailAddress}`;
      contactInfo.appendChild(email);
    }
    if (website) {
      const site = document.createElement('div');
      site.textContent = `Website: ${website}`;
      contactInfo.appendChild(site);
    }
    item.appendChild(contactInfo);
    scamList.appendChild(item);
  });
}

//filter scams based on search query across all fields
function getFilteredScams() {
  if (!searchQuery) return allScams;
  return allScams.filter(scam => 
    (scam.scamDescription && scam.scamDescription.toLowerCase().includes(searchQuery)) ||
    (scam.phoneNumber && scam.phoneNumber.toLowerCase().includes(searchQuery)) ||
    (scam.emailAddress && scam.emailAddress.toLowerCase().includes(searchQuery)) ||
    (scam.website && scam.website.toLowerCase().includes(searchQuery))
  );
}


function changePage(direction) {
  const filteredScams = getFilteredScams();
  const totalPages = Math.ceil(filteredScams.length / pageSize) || 1;

  currentPage += direction;
  if (currentPage < 1) { 
    currentPage = 1;
  }
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  renderScams();
}


//search listener
document.getElementById('searchText').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  currentPage = 1; //reset to first page on search
  renderScams();
});



// Display scams
getScamItems();
