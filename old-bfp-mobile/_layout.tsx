import React from 'react';
import { useRouter } from 'expo-router';
import { BFPApp } from './screens/BFPApp';

export default function BfpLayout() {
  const router = useRouter();

  return (
    <BFPApp
      onLogout={() => router.replace('/login')}
    />
  );
}
