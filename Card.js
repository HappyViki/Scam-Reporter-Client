const Card = ({scamDesc, scamTel, scamEmail, scamSite}) => `
<div class="scam-card">
    <p class="scam-desc">
        ${scamDesc}
    </p>

    ${scamTel ? `<div class="scam-item"> 
        <div class="scam-item__label">Phone:</div> 
        <div class="scam-item__contact">${scamTel}</div> 
    </div>` : ''}

    ${scamEmail ? `<div class="scam-item"> 
        <div class="scam-item__label">Email:</div> 
        <div class="scam-item__contact">${scamEmail}</div> 
    </div>` : ''}

    ${scamSite ? `<div class="scam-item"> 
        <div class="scam-item__label">Website:</div> 
        <div class="scam-item__contact">${scamSite}</div> 
    </div>` : ''}
</div>
`