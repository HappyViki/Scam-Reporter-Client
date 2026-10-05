const scamListApiUrl = "https://scam-reporter-api-production.up.railway.app/";

scamList.innerHTML = dummyData.map(
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
    ScamDescription: document.getElementById('ScamDescription').value,
    PhoneNumber: document.getElementById('PhoneNumber').value,
    EmailAddress: document.getElementById('EmailAddress').value,
    Website: document.getElementById('Website').value
  };

  // 2. Validate mandatory fields before sending (optional but recommended)
  if (!inputScam.ScamDescription) {
    alert('Please enter a scam description.');
    return;
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
    } else {
      const errorData = await response.json();
      alert(`Failed to add item: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error submitting scam item:', error);
    alert('A network error occurred. Please try again.');
  }
}

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
        ({ScamDescription, PhoneNumber, EmailAddress, Website}) => {
            const phoneText = PhoneNumber ? `<div>Phone: ${PhoneNumber}</div>` : '';
            const emailText = EmailAddress ? `<div>Email: ${EmailAddress}</div>` : '';
            const websiteText = Website ? `<div>Website: ${Website}</div>` : '';

            return `<div class="scamItem"><div style="margin-bottom:8px">${ScamDescription}</div><div>${phoneText} ${emailText} ${websiteText}</div></div>`;
        }
    ).join('');
    return data;
  } catch (error) {
    console.error('Error fetching scam items:', error);
  }
}

// Display scams
getScamItems();
