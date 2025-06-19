import { useState, useEffect } from 'react';
import { Visitor } from '../types/visitor';

const STORAGE_KEY = 'otto-hello-visitors';

export function useVisitorStorage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setVisitors(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading visitors from storage:', error);
      }
    }
  }, []);

  const saveVisitors = (updatedVisitors: Visitor[]) => {
    setVisitors(updatedVisitors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVisitors));
  };

  const addVisitor = (visitorData: Omit<Visitor, 'id' | 'checkInTime'>) => {
    const newVisitor: Visitor = {
      ...visitorData,
      id: crypto.randomUUID(),
      checkInTime: new Date().toISOString(),
    };
    
    const updatedVisitors = [...visitors, newVisitor];
    saveVisitors(updatedVisitors);
    return newVisitor;
  };

  const checkOutVisitor = (visitorId: string) => {
    const updatedVisitors = visitors.map(visitor =>
      visitor.id === visitorId
        ? { ...visitor, checkOutTime: new Date().toISOString() }
        : visitor
    );
    saveVisitors(updatedVisitors);
    
    return updatedVisitors.find(v => v.id === visitorId);
  };

  const getActiveVisitors = () => {
    return visitors.filter(visitor => !visitor.checkOutTime);
  };

  return {
    visitors,
    addVisitor,
    checkOutVisitor,
    getActiveVisitors,
  };
}