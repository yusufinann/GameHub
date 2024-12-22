import React, { useState } from 'react';

const Button = (props) => {
  const [count, setCount] = useState(0);

  return (
    <div>
         Your count is {count}
         <button onClick={()=>setCount((prev)=>++prev)}>Click</button>
    </div>
  );
};

export default Button;
