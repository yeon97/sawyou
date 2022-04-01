import React, { useState, useEffect } from 'react';
import Wrapper from './styles';
import { Link } from 'react-router-dom'
import Postmodal from './Postmodal/index'
import Wallet from './Wallet/index'
import { User } from '../../States/User';
import { useRecoilState } from 'recoil';


// MUI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import NativeSelect from '@mui/material/NativeSelect';
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate , withRouter } from 'react-router-dom';





const UserHeader = (props) => {
  const navigate = useNavigate(); // for redirect
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [onBox, setOnBox] = React.useState('False');
  const [category, setCategory] = React.useState('이름');
  const [user, setUser] = useRecoilState(User);



  const searchStyle = {
    position: 'fixed',
    top: 175,
    left: '48.2%',
    transform: 'translate(-50%, -50%)',
    width: 282,
    height: 200,
    bgcolor: 'white',
    border: '1px solid #dedede',
    borderRadius : 2,
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  };

  const Logout = e => {
    setUser(false)
    localStorage.removeItem('access_token');
  }

  const handelOnBox = () => {
    if (onBox === 'True'){
      setOnBox('False');
    }
    else{
      setOnBox('True');
    }
  }

  const handleChange = (e) => {
    setCategory(e.target.value);
  }
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };  
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const onClickRedirectPathHandler = name => e => {
    window.scrollTo(0, 0);
    navigate(`${name}`);
  };

  return (
    <Wrapper>
      <AppBar position="fixed" color="inherit" sx={{ width : '100%',boxShadow:0, borderBottom:1.5, borderColor: 'grey.200'}}>
        <Container sx={{ display: 'flex', justifyContent : 'center', height : 60}}>
          <Box sx={{ display: 'flex', width : 950, justifyContent : 'space-between'}}>
              <Button
                sx={{ my : "auto", fontSize: 20, color : 'black'}}
                onClick={onClickRedirectPathHandler('/')}
              >
                I SAW YOU
              </Button>
              <Box sx={{ display: 'flex', mt : 1.5}}>
              <Box
                  component="form"
                  sx={{height : 35, width : 300, display: "flex", border:1, borderColor:'grey.400', borderRadius: 3, backgroundColor: 'grey.200'}}
                >
                  <Box sx={{ml:1, display: 'flex',alignItems:'center', width:200}}>  
                    <NativeSelect
                      defaultValue={category}
                      onChange={(e) => handleChange(e)}
                    >
                      <option value={'이름'}>이름</option>
                      <option value={'닉네임'}>닉네임</option>
                      <option value={'해시태그'}>해시태그</option>
                    </NativeSelect>
                      </Box>
                  <InputBase
                    placeholder="검색"
                    sx={{height : 35, width : 300}}
                    onFocus={handelOnBox}
                    onBlur={handelOnBox}
                  />
                  <IconButton type="submit" aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Box>
              </Box>
              

              <Box sx={{ display: 'flex'}}>
                <Button 
                  key={"home"}
                  onClick={onClickRedirectPathHandler('/')}
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    minWidth: "40px",
                    minHeight: "40px"
                  }}
                  >
                    <HomeIcon sx={{ fontSize: 27, color : 'black' }}/>
                </Button>

                <Box
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    minWidth: "40px",
                    minHeight: "40px"
                    
                  }}
                  >
                  <Postmodal></Postmodal>
                </Box>

                <Button
                  key={"trade"}
                  onClick={onClickRedirectPathHandler('/nft')}
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    minWidth: "40px",
                    minHeight: "40px"
                  }}
                  >
                  <img src="/images/eth.png" />
                </Button>

                <Button 
                  onClick={handleOpenUserMenu}
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    minWidth: "40px",
                    minHeight: "40px"
                  }}  >
                  <img src="/images/baseimg_nav.jpg" />
                </Button>
                <Menu
                  sx={{ mt: '40px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                    <MenuItem key={"profile"} onClick={onClickRedirectPathHandler('/profile')}>
                      <Typography textAlign="center">프로필</Typography>
                    </MenuItem>

                    {/* <MenuItem key={"logout"} onClick={onClickLogout}> */}
                    <MenuItem key={"logout"} onClick={Logout}>
                      <Typography textAlign="center">로그아웃</Typography>
                    </MenuItem>    
                </Menu>
                <Box
                  key={"wallet"}
                  style={{
                    maxWidth: "60px",
                    maxHeight: "60px",
                    minWidth: "40px",
                    minHeight: "40px"
                  }}
                  >
                    <Wallet sx={{ fontSize: 27, color : 'black' }}/>
                </Box>

            </Box>

          </Box>
        </Container>
      </AppBar>
      { onBox === 'True' && <Box sx={searchStyle} style={{zIndex: 2000}}>
        {/* 여기에다 맵 방식으로 뿌려줄 것 */}
        <Button sx={{justifyContent:'left'}}>
          <img class="img2" src="/images/baseimg_nav.jpg" />
          <Box sx={{ml:2}}><Typography>123</Typography></Box>
        </Button>

      </Box>}
      
    </Wrapper>
  )
}

export default UserHeader;