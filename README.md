# SpendSmart : Personal Expense Tracker

SpendSmart is a personal expense tracking Android application designed to help users manage their income, monitor spending, and stay within a monthly budget.

## Features

- **Dashboard:** View total income, expenses, and available balance.
- **Transaction Management:** Add and delete income and expense records.
- **Categories:** Organize transactions into categories such as Food, Travel, Shopping, Education, and Bills.
- **Monthly Budget:** Set a custom budget and monitor spending progress.
- **Transaction History:** Review previous transactions with dates and amounts.
- **Dark Mode:** Switch between light and dark themes.
- **Local Storage:** Save transactions and preferences on the device.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Capacitor
- Android Studio

## Installation

1. Download `SpendSmart.apk` from this repository.
2. Transfer the APK to an Android device, or download it directly on the device.
3. Open the APK and follow Android's prompts to install it. You may need to allow installation from that source.
4. Open SpendSmart and start tracking transactions.

## Run from Source

1. Install Node.js and Android Studio.
2. Clone or download this repository.
3. Open a terminal in the project folder and install dependencies:

   ```bash
   npm install
   ```

4. Synchronize the Android project:

   ```bash
   npx cap sync android
   ```

5. Open the Android project:

   ```bash
   npx cap open android
   ```

6. Build and run the application using Android Studio.

## Data and Privacy

SpendSmart stores transactions and preferences locally using browser storage. The application does not require a backend server.

## Project Purpose

Developed as a Mobile Application Development assignment to demonstrate web technologies and their integration into an Android application using Capacitor.
