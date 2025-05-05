export const notificationTransactionTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EventNesia - Transaction Receipt</title>
    <style>
      /* Base Styles */
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #333;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f8f9fa;
      }
      
      /* Container */
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 0;
        background-color: #fff;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
      }
      
      /* Header */
      .header {
        background-color: #4e54c8;
        background-image: linear-gradient(to right, #4e54c8, #8f94fb);
        color: white;
        padding: 20px;
        text-align: center;
      }
      
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }
      
      .header .status-badge {
        display: inline-block;
        margin-top: 10px;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .status-success {
        background-color: #28a745;
      }
      
      .status-pending {
        background-color: #ffc107;
        color: #212529;
      }
      
      .status-failed {
        background-color: #dc3545;
      }
      
      /* Content */
      .content {
        padding: 25px;
      }
      
      .greeting {
        margin-bottom: 20px;
      }
      
      /* Transaction Info */
      .transaction-info {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 25px;
      }
      
      .transaction-info h2 {
        margin-top: 0;
        font-size: 18px;
        color: #4e54c8;
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      
      .info-label {
        font-weight: 600;
        color: #555;
      }
      
      .info-value {
        text-align: right;
      }
      
      /* Ticket Details */
      .ticket-details {
        margin-bottom: 25px;
      }
      
      .ticket-details h2 {
        font-size: 18px;
        color: #4e54c8;
        margin-bottom: 15px;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
      }
      
      .ticket-card {
        border: 1px solid #eee;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
      }
      
      .ticket-event {
        font-weight: 600;
        margin-bottom: 5px;
        color: #333;
      }
      
      .ticket-info {
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #666;
      }
      
      /* Total Section */
      .total-section {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 15px 20px;
        margin-bottom: 25px;
      }
      
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
      }
      
      .grand-total {
        font-weight: 700;
        color: #4e54c8;
        font-size: 18px;
        border-top: 1px solid #ddd;
        padding-top: 10px;
        margin-top: 10px;
      }
      
      /* Footer */
      .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        border-top: 1px solid #eee;
      }
      
      .footer p {
        margin: 5px 0;
        color: #666;
        font-size: 14px;
      }
      
      .social-links {
        margin: 15px 0;
      }
      
      .social-icon {
        display: inline-block;
        width: 36px;
        height: 36px;
        background-color: #4e54c8;
        border-radius: 50%;
        margin: 0 5px;
        line-height: 36px;
        color: white;
        text-decoration: none;
        font-weight: bold;
      }
      
      .highlight {
        color: #4e54c8;
        font-weight: 600;
      }
      
      .btn {
        display: inline-block;
        padding: 12px 25px;
        background-color: #4e54c8;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-weight: 600;
        text-align: center;
        margin: 15px 0;
      }
      
      .transaction-id {
        font-size: 12px;
        color: #888;
        text-align: center;
        margin-top: 15px;
      }
      
      /* Responsive Adjustments */
      @media screen and (max-width: 480px) {
        .container {
          margin: 10px;
          width: calc(100% - 20px);
        }
        
        .header {
          padding: 15px;
        }
        
        .content {
          padding: 15px;
        }
        
        .info-row {
          flex-direction: column;
          margin-bottom: 15px;
        }
        
        .info-value {
          text-align: left;
          margin-top: 3px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <!-- Header Section -->
      <div class="header">
        <h1>EventNesia Receipt</h1>
        <div class="status-badge status-{{statusClass}}">{{transactionStatus}}</div>
      </div>
      
      <!-- Content Section -->
      <div class="content">
        <div class="greeting">
          <p>Dear <span class="highlight">{{name}}</span>,</p>
          <p>Thank you for your purchase! Here are your transaction details:</p>
        </div>
        
        <!-- Transaction Information -->
        <div class="transaction-info">
          <h2>Transaction Details</h2>
          
          <div class="info-row">
            <div class="info-label">Date:</div>
            <div class="info-value">{{transactionDate}}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">{{email}}</div>
          </div>
          
        </div>
        
        <!-- Ticket Details -->
        <div class="ticket-details">
          <h2>Ticket Details</h2>
          {{#each tickets}}
          <div class="ticket-card">
            <div class="ticket-event">{{eventName}}</div>
            <div class="ticket-info">
              <span>{{ticketType}}</span>
              <span>{{quantity}}x @ Rp. {{price}}</span>
            </div>
            <div class="ticket-info">
              <span>{{eventDate}}</span>
              <span>{{eventLocation}}</span>
            </div>
          </div>
          {{/each}}
        </div>
        
        <!-- Total Section -->
        <div class="total-section">
          <div class="total-row">
            <div>Subtotal:</div>
            <div>Rp. {{totalPrice}}</div>
          </div>
          <div class="total-row">
            <div>Discount:</div>
            <div>Rp. {{totalDiscount}}</div>
          </div>
          <div class="total-row">
            <div>Service Fee:</div>
            <div>Rp. {{serviceFee}}</div>
          </div>
          <div class="total-row grand-total">
            <div>Total:</div>
            <div>Rp. {{total}}</div>
          </div>
        </div>
      </div>
      
      <!-- Footer Section -->
      <div class="footer">
        <div class="social-links">
          <a href="https://facebook.com/eventnesia" class="social-icon">f</a>
          <a href="https://instagram.com/eventnesia" class="social-icon">i</a>
          <a href="https://twitter.com/eventnesia" class="social-icon">t</a>
        </div>
        <p>EventNesia - Your trusted platform for event ticketing.</p>
        <p>Need help? Contact our support team at
          <a href="mailto:support@eventnesia.com" class="highlight">support@eventnesia.com</a>
        </p>
        <p>&copy; {{currentYear}} EventNesia. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
