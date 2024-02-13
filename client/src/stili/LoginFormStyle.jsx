import styled from 'styled-components';

const Main = styled.div`
  width: 350px;
  height: 500px;
  border-radius: 10px;
  box-shadow: 5px 20px 50px #000;
  overflow: hidden;
`;

const Signup = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #f9c322;
`;

const StyledLabelreg = styled.label`
  color: #2D2D2D;
  font-size: 2.3em;
  display: flex;
  justify-content: center;
  margin: 60px;
  font-weight: bold;
  cursor: pointer;
  transition: .5s ease-in-out;
`;

const StyledLabellog = styled.label`
  color: #f9c322;
  font-size: 2.3em;
  display: flex;
  justify-content: center;
  margin: 60px;
  font-weight: bold;
  cursor: pointer;
  transition: .5s ease-in-out;
`;
const StyledInput = styled.input`
  width: 60%;
  height: 20px;
  background: #e0dede;
  display: flex;
  justify-content: center;
  margin: 20px auto;
  padding: 10px;
  border: none;
  outline: none;
  border-radius: 5px;
`;

const StyledButton = styled.button`
  width: 60%;
  height: 40px;
  margin: 10px auto;
  display: block;
  color: #2D2D2D;
  background: #f9c322;
  font-size: 1em;
  font-weight: bold;
  margin-top: 20px;
  outline: none;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: .2s ease-in;

  &:hover {
    background: #00436F;
  }
`;

const Login = styled.div`
  height: 460px;
  background: #2D2D2D;
  border-radius: 60% / 10%;
  transition: .8s ease-in-out;
`;


export { Main, Signup, StyledLabellog, StyledLabelreg, StyledInput, StyledButton, Login };
