import React from 'react'

const Dots = () => {
  
  return (
    <>
    {Array.from({ length: 35 }).map((_, i) => {
    const style = {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    };
    return (
      <div
        key={i}
        className='bg-white w-2 h-2 rounded-full absolute'
        style={style}
      ></div>
    );
  })}
    </>
  );
}

export default Dots
