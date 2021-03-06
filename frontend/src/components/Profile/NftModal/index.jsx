import React, { useState, useEffect } from 'react';
import { 
  Button,
  Box, 
  Modal,
  CircularProgress, 
  TextField, 
  Avatar,
  Table,
  TableContainer,
  TableRow,
  Typography,
  InputAdornment
 }  
from '@mui/material';
import { ReadNft, CellNft } from '../../../api/nft';
import { User } from '../../../States/User';
import { Wallet } from '../../../States/Wallet';
import { useRecoilValue } from 'recoil';
import { useParams } from 'react-router';
import { Profile}  from '../../../api/user';
import Web3 from 'web3';
import SaleFactory from '../../../abi/SaleFactory.json';
import SsafyNFT from '../../../abi/SsafyNFT.json';
import Swal from 'sweetalert2';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '65%',
  height: '90%',
  bgcolor: 'background.paper'
};

const style2 = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '660px',
  height: '200px',
  bgcolor: 'background.paper'
};

const style3 = {
  display: 'flex',
  height: '70%',
  width: '660px',
  alignItems: 'center',
  justifyContent: 'center'
}

const Postmodal = ({ item, userData }) => {
  const [open, setOpen] = React.useState(false);
  const [open2, setOpen2] = React.useState(false);
  const handleClose2 = () => setOpen2(false);
  const handleOpen = () => setOpen(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [nftDetail, setNftDetail] = useState('');
  const wallet = useRecoilValue(Wallet);
  const user = useRecoilValue(User);
  const [price, setPrice] = useState('');
  const [web3, setWeb3] = React.useState();
  const [userSeq, setUserSeq] = useState('');
  const [userProfile, setUserProfile] = useState('');


  const handleClose = () => {
    if (isSaleLoaded === false) {
      return
    }
    setOpen(false);
  }

  const handleOpen2 = () => {
    if (open2 === false) {
      setOpen2(true)
    }
    else {
      return;
    }
  }
  useEffect(() => {
    if (typeof window.ethereum != "undefined") {
      try {
        const web = new Web3(window.ethereum);
        setWeb3(web);
      } catch (err) {
      }
    }
  }, []);

  useEffect(() => {
    if (selectedImage) {
      setImageUrl(URL.createObjectURL(selectedImage));
    }
    ReadNft(item.nftSeq).then((res) => {
      setNftDetail(res.data.data)
      setUserSeq(res.data.data.nftOwnerName)
    });
    Profile(userData).then((res)=>{setUserProfile(res.data.data.userProfile)})
  }, [selectedImage]);

  /* ?????? ?????? */

  const [isSaleLoaded, setIsSaleLoaded] = useState(true);

  const handleSellButtonClick = async () => {
    handleClose2();
    setIsSaleLoaded(false);

    try {
      const saleFactoryContract = await new web3.eth.Contract(
        SaleFactory.abi,
        "0x0922ea92B9C3f3C580127BE07aeEfDad9CBc3540",
        { from: wallet }
      );

      const now = Math.floor(new Date().getTime() / 1000);

      // SaleFactory??? ?????? createSale ??????
      await saleFactoryContract.methods
        .createSale(
          nftDetail.nftTokenId,
          1,
          price,
          now,
          now + 3600 * 72,
          "0x6C927304104cdaa5a8b3691E0ADE8a3ded41a333",
          "0x6c5BC9afdFf1E7354A1A03E7f8683d78EEe231E2"
        )
        .send({ from: wallet });

      // 2??????????????? ?????????????????? ?????? ??????

      // ?????? ????????? Sale ???????????? ?????? ??????
      const sales = await saleFactoryContract.methods.allSales().call();
      const saleContractAddress = sales[sales.length - 1];

      // ERC-721 Contract
      const erc721Contract = await new web3.eth.Contract(
        SsafyNFT.abi,
        "0x6c5BC9afdFf1E7354A1A03E7f8683d78EEe231E2"
      );

      // Sale ?????????????????? wallet??? ???????????? token??? ????????? ????????????.
      await erc721Contract.methods
        .approve(saleContractAddress, nftDetail.nftTokenId)
        .send({ from: wallet })
        .then(() => {
        });

      // wallet?????? ?????? Sale ??????????????? ????????? ?????????.
      await erc721Contract.methods
        .transferFrom(wallet, saleContractAddress, nftDetail.nftTokenId)
        .send({ from: wallet })
        .then(() => {
        });

      // ????????? ?????? API ??????
      await sellOnServer(saleContractAddress);

      handleClose();
      Swal.fire({
        title: ' Success ',
        text: '?????? ????????? ?????????????????????. ???',
        icon: 'success',
        confirmButtonText: '??????'
      })
    }

    catch (error) {
      handleClose();
      Swal.fire({
        title: ' Error ',
        text: '?????? ????????? ?????????????????????. ????',
        icon: 'error',
        confirmButtonText: '??????',
      })
    }

    finally {
      setIsSaleLoaded(true);
    }
  }

  // ?????? : ?????????
  const sellOnServer = async (saleContractAddress) => {

    const request = {
      "nftSeq": item.nftSeq,
      "salePrice": price,
      "saleContractAddress": saleContractAddress,
    }
    await CellNft(request);
  }

  const params = useParams().id;

  const pricemodal = (
    <Box sx={style2}>
      <Box sx={style3}><Typography>?????? ??????  </Typography>
        <TextField
          id="outlined-start-adornment"
          sx={{ ml: 5, width: '50ch' }}
          onChange={(event) => setPrice(event.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end"><img src="/images/SSF.jpg"/></InputAdornment>,
          }}
        /> 
        </Box>
      <Box sx={{ display: 'flex', height: '20%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          sx={{ width: '30%' }}
          variant="contained"
          type="submit"
          onClick={handleSellButtonClick}
        >
          ????????????
        </Button></Box>
    </Box>
  );

  const newpost = (
      <Box sx={style} component="form">
        <Box sx={{ display: 'flex', height: '100%' }}>
          <Box sx={{ width: '68%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <img src={item.nftPictureLink} alt={item.nftPictureLink} height="100%" width="100%"/>
            </Box>
          </Box>
          <Box sx={{ width: '32%' }}>
            <Box sx={{ height: '95%' }}>
              <Box sx={{ display: 'flex', height: '7%', alignItems: 'center' }} borderBottom={1} borderColor="#e3e3e3">
                <Box sx={{ display: 'flex', height: '50%', }}>
                {userProfile
                ? <Avatar sx={{ width: 30, height: 30, mx: 1.2 }} alt="User" src={userProfile}/> 
                : <Avatar sx={{ width: 30, height: 30 }} alt="User" src="/images/baseimg.jpg"/>}
                </Box>
                <Typography 
                  variant="h6" 
                  sx={{ mt: 0.2 }}
                >
                  {nftDetail.nftOwnerName}
                </Typography>
              </Box>
              <Box sx={{ mx: 1 }}>
                <Box sx={{ width: '100%', mx: 1.2, mt: 2 }}>
                  <Typography variant="h3" gutterBottom>
                      {nftDetail.nftTitle}
                  </Typography>
                </Box>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  component="div" 
                  sx={{ mx: 1.2, mt: 1 }}
                >
                  NFT ??????
                </Typography>
                <TableContainer>
                <Table>
                <TableRow sx={{ border: 1, borderColor:"#e3e3e3" }}>
                <Typography 
                  variant="h7" 
                  gutterBottom 
                  display='flex' 
                  justifyContent='space-between'
                  alignItems='center'
                  fontWeight={600}
                  sx={{ mx: 1.2, my: 1 }}
                >
                  ?????????
                  <Typography variant="h7" fontWeight={300}>
                    {nftDetail.nftAuthorName}
                  </Typography>
                </Typography>
                <Typography 
                  variant="h7"
                  gutterBottom 
                  display='flex' 
                  justifyContent='space-between'
                  alignItems='center'
                  fontWeight={600}
                  sx={{ mx: 1.2, my: 1 }}
                >
                  ?????????
                  <Typography variant="h7" fontWeight={300}> 
                    {nftDetail.nftTitle}
                  </Typography>
                </Typography>
                <Typography 
                  variant="h7" 
                  gutterBottom 
                  display='flex' 
                  justifyContent='space-between'
                  alignItems='center'
                  fontWeight={600}
                  sx={{ mx: 1.2, my: 1 }}
                >
                  ?????? ID
                  <Typography variant="h7" fontWeight={300}>
                    {nftDetail.nftTokenId}
                  </Typography>
                </Typography>              
                </TableRow>
                </Table>
                </TableContainer>
                <br/>
                <TableContainer>
                  <Table>
                    <TableRow sx={{ border: 1, borderColor:"#e3e3e3" }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        fontWeight={600}
                        fontSize="1rem"
                        sx={{ mx: 1.2, my: 1 }}
                      >
                        ?????? ??????
                        <Typography 
                          variant="body2"
                          fontWeight={300}
                        >
                          {nftDetail.nftDesc}
                        </Typography>
                      </Typography>
                    </TableRow>
                  </Table>
                </TableContainer>
                <Typography 
                  variant="body1"
                  fontWeight={600}
                  sx={{ mx: 1.2, my: 1 }}
                >
                  Market ????????????
                  <Typography variant="body2" sx={{ mx: 0.1, my: 1 }}> 
                    1. ????????? SSAFY WALLET ??? ????????????(ETH)??? ???????????? ???????????? ???????????????.
                  </Typography>
                  <Typography variant="body2" sx={{ mx: 0.1, my: 1 }}>
                    2. ?????? ????????? ???????????? ?????? ????????? ??????????????? ???????????? ???????????? ??????????????????.
                  </Typography>
                  <Typography variant="body2" sx={{ mx: 0.1, my: 1 }}>
                    3. ?????? NFT??? ????????? ??????????????? ?????? ?????? (??????????????? ?????? ??????)??? ????????? ?????? ?????? NFT??? ?????? ??????????????? ????????? ??? ????????????.
                  </Typography>
                  <Typography variant="body2" sx={{ mx: 0.1, my: 1 }}>
                    4. ?????? NFT ?????? ????????? ????????? ???????????????.
                  </Typography>
                </Typography>
              </Box>
            </Box>
            {
              // ??????????????? ????????? ??? (???????????? ???????????? ?????? ?????? ???????????? ????????? ?????????)
              // ??????????????? ownerAddress??? ???????????? ??????
              user !== params 
              ?
                <div></div> 
              :
                wallet === null 
                ?
                  <Button sx={{ ml: 0.5, width: '98%' }} variant="contained" color="error" >
                    ?????? ?????? ?????? ????????? ???????????????.
                  </Button> :
                  wallet !== nftDetail.nftOwnerAddress 
                  ?
                    <Button sx={{ ml: 0.5, width: '98%' }} variant="contained" color="error" >
                      ?????? ????????? ???????????? ????????????.
                      </Button> 
                  :
                    isSaleLoaded !== true 
                    ? 
                      <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress />
                      </Box> 
                    :
                      item.nftForSale === true 
                      ?
                        <Button sx={{ ml: 0.5, width: '98%' }} variant="contained" color="warning" >
                          ?????????
                        </Button> 
                      :
                        <Button sx={{ ml: 0.5, width: '98%' }} variant="contained" onClick={handleOpen2} disabled={!isSaleLoaded}>
                          ????????????
                          <Modal
                            open={open2}
                            onClose={handleClose2}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                            closeAfterTransition
                          >
                            {pricemodal}
                          </Modal>
                        </Button>
            }
          </Box>
        </Box>
      </Box>

  );

  return (
    <div class='div2'>
      <Button
        key={"add"}
        onClick={handleOpen}
        sx={{ width: '300px', height: '300px' }}
      >
        <img
          class={"img2"}
          src={item.nftPictureLink}
          srcSet={item.nftPictureLink}
          alt={item.nftPictureLink}
          loading="lazy"
        />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
      >
        {newpost}
      </Modal>
    </div>
  )
}

export default Postmodal;