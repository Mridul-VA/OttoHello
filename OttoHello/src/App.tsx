import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import CheckInForm from './components/CheckInForm';
import CheckOutForm from './components/CheckOutForm';
import ConfirmationScreen from './components/ConfirmationScreen';
import { useVisitorStorage } from './hooks/useVisitorStorage';
import { ReasonForVisit } from './types/visitor';

type AppScreen = 'welcome' | 'checkin' | 'checkout' | 'confirmation';

interface ConfirmationData {
  type: 'checkin' | 'checkout';
  visitorName: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);
  const { visitors, addVisitor, checkOutVisitor } = useVisitorStorage();

  const handleCheckIn = async (data: {
    fullName: string;
    reasonForVisit: ReasonForVisit;
    otherReason?: string;
    personToMeet: string;
    photo?: string;
  }) => {
    // 1. Store locally
    addVisitor(data);

    // 2. Prepare data for Google Sheets
    const payload = {
      fullName: data.fullName,
      purpose: data.reasonForVisit === 'other' ? data.otherReason : data.reasonForVisit,
      personToMeet: data.personToMeet,
      checkInTime: new Date().toLocaleString(),
      checkOutTime: ''
    };

    // 3. Submit to Google Sheets
    try {
      const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(
        'https://script.google.com/macros/s/AKfycbw1aL_ch6MfELVIttYSadogMa8V2Xvmr55wMvzAQtuJZYdPt45Y7pp83q81cmPXAsKN0Q/exec'
      );
    
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets submission failed: ${errorText}`);
      }
    } catch (err: any) {
      console.error('Google Sheets Error:', err);
      alert(`Check-in saved locally, but Google Sheets submission failed:\n${err.message}`);
    }
    

    // 4. Show confirmation
    setConfirmationData({
      type: 'checkin',
      visitorName: data.fullName
    });
    setCurrentScreen('confirmation');
  };

  const handleCheckOut = (visitorId: string) => {
    const visitor = checkOutVisitor(visitorId);
    if (visitor) {
      setConfirmationData({
        type: 'checkout',
        visitorName: visitor.fullName
      });
      setCurrentScreen('confirmation');
    }
  };

  const returnToHome = () => {
    setCurrentScreen('welcome');
    setConfirmationData(null);
  };

  switch (currentScreen) {
    case 'checkin':
      return (
        <CheckInForm
          onSubmit={handleCheckIn}
          onBack={() => setCurrentScreen('welcome')}
        />
      );

    case 'checkout':
      return (
        <CheckOutForm
          visitors={visitors}
          onCheckOut={handleCheckOut}
          onBack={() => setCurrentScreen('welcome')}
        />
      );

    case 'confirmation':
      return confirmationData ? (
        <ConfirmationScreen
          type={confirmationData.type}
          visitorName={confirmationData.visitorName}
          onReturn={returnToHome}
        />
      ) : null;

    default:
      return (
        <WelcomeScreen
          onCheckIn={() => setCurrentScreen('checkin')}
          onCheckOut={() => setCurrentScreen('checkout')}
        />
      );
  }
}

export default App;

