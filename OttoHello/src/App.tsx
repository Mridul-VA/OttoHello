import React, { useState } from 'react';
import WelcomeScreen         from './components/WelcomeScreen';
import CheckInForm           from './components/CheckInForm';
import CheckOutForm          from './components/CheckOutForm';
import ConfirmationScreen    from './components/ConfirmationScreen';
import { useVisitorStorage } from './hooks/useVisitorStorage';

/* ─── simple screen enum ─────────────────────────────────────── */
type Screen = 'welcome' | 'checkin' | 'checkout' | 'confirmation';

interface ConfirmationData {
  type: 'checkin' | 'checkout';
  visitorName: string;
}

/* ────────────────────────────────────────────────────────────── */

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [confirm, setConfirm] = useState<ConfirmationData | null>(null);

  /* local helper so the checkout screen can list visitors */
  const { visitors, addVisitor, checkOutVisitor } = useVisitorStorage();

  /* ─── called by CheckInForm when Supabase insert succeeds ─── */
  const handleCheckInSuccess = (visitorName: string) => {
    /* keep a lightweight local record (id, name, timestamps)   */
    addVisitor({
      fullName: visitorName,
    });
    

    setConfirm({ type: 'checkin', visitorName });
    setScreen('confirmation');
  };

  /* ─── visitor check-out ───────────────────────────────────── */
  const handleCheckOut = (visitorId: string) => {
    const v = checkOutVisitor(visitorId);
    if (v) {
      setConfirm({ type: 'checkout', visitorName: v.fullName });
      setScreen('confirmation');
    }
  };

  /* ─── ui “router” ─────────────────────────────────────────── */
  return (
    <>
      {screen === 'welcome' && (
        <WelcomeScreen
          onCheckIn={() => setScreen('checkin')}
          onCheckOut={() => setScreen('checkout')}
        />
      )}

      {screen === 'checkin' && (
        <CheckInForm
          onSubmit={handleCheckInSuccess}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'checkout' && (
        <CheckOutForm
          visitors={visitors}
          onCheckOut={handleCheckOut}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'confirmation' && confirm && (
        <ConfirmationScreen
          type={confirm.type}
          visitorName={confirm.visitorName}
          onReturn={() => {
            setScreen('welcome');
            setConfirm(null);
          }}
        />
      )}
    </>
  );
}

export default App;    
