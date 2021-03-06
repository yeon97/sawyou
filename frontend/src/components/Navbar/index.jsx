import React, { useState, useEffect } from 'react';
import Wrapper from './styles';
import { Link } from 'react-router-dom'
import Postmodal from './Postmodal/index';
import WalletIdx from './Wallet/index';
import { User } from '../../States/User';
import { Wallet } from '../../States/Wallet';
import { UserImage } from '../../States/UserImage';
import { useRecoilState } from 'recoil';
import { SearchUserPost, SearchHashTagPost } from '../../api/list';
import { Profile } from '../../api/user';
import { useRecoilValue } from 'recoil';

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
import NativeSelect from '@mui/material/NativeSelect';
import { makeStyles } from "@material-ui/core/styles";
import { useNavigate, withRouter } from 'react-router-dom';



import Badge from '@mui/material/Badge';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Web3 from "web3";
import SsafyToken from '../../../src/abi/SsafyToken.json';

const image2 = {
  height: "27px",
  width: "27px"
}

const image3 = {
  height: "38px",
  width: "140px"
}

const UserHeader = (props) => {
  const navigate = useNavigate(); // for redirect
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [onBox, setOnBox] = React.useState('False');
  const [category, setCategory] = React.useState('계정');
  const [user, setUser] = useRecoilState(User);
  const [wallet, setWallet] = useRecoilState(Wallet);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState('');
  const [check, setCheck] = useState(false);
  const [invisible, setInvisible] = useState(false);
  const [web3, setWeb3] = React.useState();
  const [balance, setBalance] = React.useState(null);
  const [userData, setUserData] = useState('');
  const userImage2 = useRecoilValue(UserImage);

  useEffect(() => {
    if (typeof window.ethereum != "undefined") {
      try {
        const web = new Web3(window.ethereum);
        setWeb3(web);
      } catch (err) {
      }
    }
    if (wallet === null) {
      setInvisible(true)
    }
    else {
      // getBalance()
      setInvisible(false)
    }
    

  }, []);


  const handleBadgeVisibility = async () => {

    // 지갑이 연동되어있지 않을때
    if (wallet === null) {
      await connectWallet();
      // await getBalance();
      setInvisible(!invisible);
    }
    // 지갑이 연동되어 있을때
    else {
      await connectWallet();
    }
  };
  const connectWallet = async () => {
    // 메타마스크 지갑과 연결된 계정 정보를 받는 JSON-RPC Call API
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
  };


  const searchStyle = {
    position: 'fixed',
    top: 175,
    left: '48.2%',
    transform: 'translate(-50%, -50%)',
    width: 282,
    height: 200,
    bgcolor: 'white',
    border: '1px solid #dedede',
    borderRadius: 2,
    p: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  };

  const Logout = e => {
    setUser(false)
    setWallet(null)
    localStorage.removeItem('access_token');
  }



  const handelOnBox = () => {
    if (search){
      setOnBox(true);
    }
    else{
      return
    }
    
  }
  const handelOffBox = (e) => {
    setOnBox('false');
  }


  const handleChange = (e) => {
    setCategory(e.target.value);
    setSearch('');
    setResult('');
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
    handleCloseUserMenu()
    setSearch('');
  };

  const onClickRedirectPathHandler2 = name => e => {
    window.scrollTo(0, 0);
    navigate(`${name}`);
    handleCloseUserMenu()
    setSearch('');
    
    window.location.reload()
  };
  const handleInputSearch = (e) => {
    setSearch(e.target.value)

    if (e.target.value){
      setOnBox(true)
    }
    else{
      setOnBox(false)
    }

    if (category === '계정') {
      searchAccount(e.target.value)
    }
    else {
      searchHashTag(e.target.value)
    }
  }

  const searchAccount = async (data) => {
    const body = {
      keyword: data
    }
    const res = await SearchUserPost(body).then((res) => setResult(res.data.data))
      .catch(setResult(''))
    if (data === '') {
      setResult('')
    }
    // setResult(res.data.data)
  }

  const searchHashTag = async (data) => {
    const body = {
      keyword: data
    }
    const res = await SearchHashTagPost(body).then((res) => setResult(res.data.data))
      .catch(setResult(''))
    if (data === '') {
      setResult('')
    }

  }
  const handleSearch = () => {
  }


  return (
    <Wrapper>
      <AppBar position="fixed" color="inherit" sx={{ width: '100%', boxShadow: 0, borderBottom: 1.5, borderColor: 'grey.200' }}>
        <Container sx={{ display: 'flex', justifyContent: 'center', height: 60 }}>
          <Box sx={{ display: 'flex', width: 950, justifyContent: 'space-between' }}>
            <Button
              sx={{ my: "auto", fontSize: 20, color: 'black' }}
              onClick={onClickRedirectPathHandler('/')}
            >
              <img style={image3} src="/images/base.png" />
            </Button>
            <Box sx={{ display: 'flex', mt: 1.5 }}>
              <Box
                component="form"
                sx={{ height: 35, width: 300, display: "flex", border: 1, borderColor: 'grey.400', borderRadius: 3, backgroundColor: 'grey.200' }}
              >
                <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', width: 200 }}>
                  <NativeSelect
                    defaultValue={category}
                    onChange={(e) => handleChange(e)}
                    disableUnderline
                  >
                    <option value={'계정'}>계정</option>
                    <option value={'해시태그'}>해시태그</option>
                  </NativeSelect>
                </Box>
                <InputBase
                  placeholder="검색"
                  sx={{ height: 35, width: 300 }}
                  value={search}
                  onFocus={handelOnBox}
                  onBlur={handelOffBox}
                  onChange={handleInputSearch}
                />
                <IconButton type="submit" aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Box>
            </Box>


            <Box sx={{ display: 'flex' }}>
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
                <HomeIcon sx={{ fontSize: 27, color: 'black' }} />
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
                }}>
                {userImage2 ? <Avatar style={image2} src={userImage2} /> : <img style={image2} src="/images/baseimg.jpg" />}
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
                <MenuItem key={"profile"} onClick={onClickRedirectPathHandler2(`/profile/${user}`)}>
                  <Typography textAlign="center">프로필</Typography>
                </MenuItem>

                {/* <MenuItem key={"logout"} onClick={onClickLogout}> */}
                <MenuItem key={"logout"} onClick={Logout}>
                  <Typography textAlign="center">로그아웃</Typography>
                </MenuItem>
              </Menu>

              <Button
                onClick={() => { handleBadgeVisibility(); }}
                style={{
                  maxWidth: "60px",
                  maxHeight: "60px",
                  minWidth: "50px",
                  minHeight: "40px"
                }}  >
                <Badge color="secondary" variant="dot" max={9999} invisible={invisible}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 27, color: '#484848' }} />
                </Badge>
              </Button>

            </Box>
          </Box>
        </Container>
      </AppBar>
      {onBox === true && <Box sx={searchStyle} style={{ zIndex: 2000 }} onBlur={handelOnBox}>
        {result && category === '계정' ? result.map((data) => (
          <Button style={{textTransform: 'lowercase'}} key={data.userId} sx={{ justifyContent: 'left' }} onMouseDown={onClickRedirectPathHandler2(`/profile/${data.userId}`)}>
            {data.userProfile ? <Avatar sx={{ width: 30, height: 30 }} src={data.userProfile} /> : <img class="img2" src="/images/baseimg_nav.jpg" />}
            {/* <Box sx={{ ml: 2 }}><Typography>{data.userId}</Typography></Box> */}
            <Box sx={{ ml: 2 }}><Typography>{data.userId} ({data.userName})</Typography></Box>
          </Button>
        )) : null}
        {result && category === '해시태그' ? result.map((data) => (
          <Button style={{textTransform: 'lowercase'}} key={data.hashtagName} sx={{justifyContent:'left'}} onMouseDown={onClickRedirectPathHandler2(`/search/tags/${data.hashtagName}`)}>
            <img class="img2" src="/images/baseimg_hash.PNG" />
            <Box sx={{ ml: 2 }}><Typography>{data.hashtagName}</Typography></Box>
          </Button>
        )) : null}
      </Box>}

    </Wrapper>
  )
}

export default UserHeader;