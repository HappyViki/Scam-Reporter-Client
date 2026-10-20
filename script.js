const scamListApiUrl = "https://scam-reporter-api-production.up.railway.app/";

scamList.innerHTML = dummyData.map( //this will be deleted
    ({description, scamPhone, scamEmail, scamWebsite}) => {
        const phoneText = scamPhone ? `<div>Phone: ${scamPhone}</div>` : '';
        const emailText = scamEmail ? `<div>Email: ${scamEmail}</div>` : '';
        const websiteText = scamWebsite ? `<div>Website: ${scamWebsite}</div>` : '';

        return `<div class="scamItem"><div style="margin-bottom:8px">${description}</div><div>${phoneText} ${emailText} ${websiteText}</div></div>`;
    }
).join('');

async function addScamItem() {
  // 1. Gather input values from the HTML form
  const inputScam = {
    ScamDescription: document.getElementById('description').value.trim(),
    PhoneNumber: document.getElementById('scamPhone').value.trim(),
    EmailAddress: document.getElementById('scamEmail').value.trim(),
    Website: document.getElementById('scamWebsite').value.trim()
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


/* Old code, may want later */
/*
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
    
    const data = await response.json();
    console.log(data);
    scamList.innerHTML = data.map(
        ({scamDescription, phoneNumber, emailAddress, website}) => {
            const phoneText = phoneNumber ? `<div>Phone: ${phoneNumber}</div>` : '';
            const emailText = emailAddress ? `<div>Email: ${emailAddress}</div>` : '';
            const websiteText = website ? `<div>Website: ${website}</div>` : '';

            return `<div class="scamItem"><div style="margin-bottom:8px">${scamDescription}</div><div>${phoneText}<br/>${emailText}<br/>${websiteText}</div></div>`;
        }
    ).join('');
    return data;
  } catch (error) {
    console.error('Error fetching scam items:', error);
  }
}
*/

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

    const data = await response.json();
    console.log(data);

    data.forEach(({scamDescription, phoneNumber, emailAddress, website}) => {
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
    return data;

  } catch (error) {
    console.error('Error fetching scam items:', error);
  }
}



// Display scams
getScamItems();
