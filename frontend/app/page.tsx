import Image from "next/image";

export default function Home() {
  return (
    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <div style={{width: '50%'}}>
      <iframe
        src="/KrcniNased"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none'
        }}
      />
      </div>
      <div style={{width: '50%'}}>
      <iframe
        src="/PreverbaKrcniNased"
        style={{
          width: '100%',
          height: '100vh',
          border: 'none'
        }}
      />
      </div>
    </div>
  );
}
