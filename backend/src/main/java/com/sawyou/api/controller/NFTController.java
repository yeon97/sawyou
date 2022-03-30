package com.sawyou.api.controller;

import com.sawyou.api.response.NftInfoRes;
import com.sawyou.api.response.NftListRes;
import com.sawyou.api.response.NftOnSaleDetailRes;
import com.sawyou.api.response.NftOnSaleRes;
import com.sawyou.api.service.NFTService;
import com.sawyou.common.model.response.Result;
import io.swagger.annotations.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import springfox.documentation.annotations.ApiIgnore;
import java.util.List;

/**
 * NFT 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "NFT API", tags = {"NFT"})
@RestController
@RequestMapping("/api/v1/nft")
public class NFTController {

    @Autowired
    private NFTService nftService;

    @GetMapping("/{userSeq}")
    @ApiOperation(value = "NFT 보유 내역 조회", notes = "유저가 보유한 NFT를 조회한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "보유한 NFT가 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> getNftList(@ApiIgnore Authentication authentication, @PathVariable @ApiParam(value = "조회할 유저", required = true) Long userSeq) {
        //로그인이 되어있지 않다면
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증실패").build());

        List<NftListRes> nftList = nftService.getNftList(userSeq);

        if (nftList.isEmpty())
            return ResponseEntity.status(404).body(Result.builder().status(404).message("보유한 NFT가 없음").build());

        return ResponseEntity.status(200).body(Result.builder().data(nftList).status(200).message("유저가 보유한 NFT 조회 성공").build());
    }

    @GetMapping("/detail/{nftSeq}")
    @ApiOperation(value = "NFT 상세 조회", notes = "NFT를 상세 조회한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "해당 NFT가 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> getNftInfo(@ApiIgnore Authentication authentication, @PathVariable @ApiParam(value = "조회할 NFT", required = true) Long nftSeq) {
        //로그인이 되어있지 않다면
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증실패").build());

        NftInfoRes nftInfo = nftService.getNftInfo(nftSeq);

        if (nftInfo == null)
            return ResponseEntity.status(404).body(Result.builder().status(404).message("보유한 NFT가 없음").build());

        return ResponseEntity.status(200).body(Result.builder().data(nftInfo).status(200).message("NFT 상세 조회 성공").build());
    }


    @GetMapping("market")
    @ApiOperation(value = "판매중인 NFT 조회", notes = "판매중인 모든 NFT를 조회한다.")
    @ApiResponses({
            @ApiResponse(code = 200, message = "성공"),
            @ApiResponse(code = 401, message = "인증 실패"),
            @ApiResponse(code = 404, message = "판매중인 NFT가 없음"),
            @ApiResponse(code = 500, message = "서버 오류")
    })
    public ResponseEntity<Result> getOnSaleList(@ApiIgnore Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

		List<NftOnSaleRes> nftOnSaleRes = nftService.getOnSaleList();
		if(nftOnSaleRes.isEmpty())
			return ResponseEntity.status(404).body(Result.builder().status(404).message("판매중인 NFT가 없음").build());
		return ResponseEntity.status(200).body(Result.builder().status(200).data(nftOnSaleRes).message("판매중인 NFT조회 성공").build());
	}

	@GetMapping("market/{nftSeq}")
	@ApiOperation(value = "판매중인 NFT 상세 조회", notes = "판매중인 특정 NFT를 조회한다.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "판매중인 NFT가 없음"),
			@ApiResponse(code = 500, message = "서버 오류")
	})
	public ResponseEntity<Result> getOnSale(@ApiIgnore Authentication authentication, @PathVariable Long nftSeq){
		if(authentication==null) return ResponseEntity.status(401).body(Result.builder().status(401).message("인증 실패").build());

		NftOnSaleDetailRes nftOnSaleDetailRes = nftService.getOnSale(nftSeq);
		if(nftOnSaleDetailRes==null)
			return ResponseEntity.status(404).body(Result.builder().status(404).message("판매중인 NFT가 없음").build());
		return ResponseEntity.status(200).body(Result.builder().status(200).data(nftOnSaleDetailRes).message("판매중인 NFT 상세 조회 성공").build());
	}


}
