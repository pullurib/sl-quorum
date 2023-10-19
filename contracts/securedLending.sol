// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BPToken.sol";


contract SecuredLending {
    enum LoanState { Proposed, Funded, Paid, Retracted, Defaulted }

    struct Loan {
        address borrower;
        address lender;
        uint256 nftId;
        uint256 amount;
        uint256 interest;
        uint256 daysForRepayment;
        uint256 amountLeft;
        uint256 defaultDate;
        LoanState state;
    }

    mapping(uint256 => Loan) public loans;
    mapping(uint256 => address) public nftOwnership; //simulate nft ownership
    uint256 public nextLoanId;
    address tokenAddress;
    IERC20 private token;

    constructor(IERC20 ta){
        token = ta;
        nextLoanId = 0;
    }

    event LoanStateChange(uint256 indexed loanId, uint indexed state);

    // To simulate transferring NFTs to and from the contract for escrow
    function transferNFT(address to, uint256 nftId) internal {
        nftOwnership[nftId] = to;
    }

    // Propose a new loan
    function proposeLoan( uint256 nftId, uint256 amount, uint256 interest, uint256 daysForRepayment) external returns (uint256) {

        // Transfer NFT to this contract for escrow
        transferNFT(address(this), nftId);

        // Create Loan entity
        loans[nextLoanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            nftId: nftId,
            amount: amount,
            interest: interest,
            daysForRepayment: daysForRepayment,
            amountLeft: 0,
            defaultDate: 0,
            state: LoanState.Proposed
        });

        emit LoanStateChange(nextLoanId,(uint)(LoanState.Proposed));
        nextLoanId++;
        return nextLoanId - 1;
    }

    // Fund a loan
    function fundLoan(uint256 loanId) external {
        require(loanId < nextLoanId, "Loan doesn't exist");
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Proposed, "Loan is not in Proposed state");
        
      

        // Check if lender has enough tokens
        require(token.balanceOf(msg.sender) >= loan.amount, "Insufficient funds");

          

        // Update loan
        loan.state = LoanState.Funded;
        loan.lender = msg.sender;
        loan.defaultDate = block.timestamp + (loan.daysForRepayment * 1 days);
        loan.amountLeft = loan.amount + loan.interest; 

        

        // Transfer tokens from lender to borrower
        token.transferFrom( msg.sender, loan.borrower, loan.amount);


        //TODO: revert state if the transaction fails

        emit LoanStateChange(loanId,(uint)(LoanState.Funded));
    }

    // Repay a loan
    function repayLoan(uint256 loanId, uint256 amount) external {
        //validity check for amount?
        require(loanId < nextLoanId, "Loan doesn't exist");
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Funded, "Loan is not in Funded state");
        require(msg.sender == loan.borrower, "Only the borrower can repay the loan");
        require(amount <= loan.amountLeft, "Repayment amount is greater than amount left");
        require(block.timestamp <= loan.defaultDate, "Loan has defaulted");

        // Transfer tokens from borrower to lender
        
        require(token.transferFrom(msg.sender, loan.lender, amount), "Token transfer failed");

        // Update loan
        loan.amountLeft -= amount;
        if (loan.amountLeft == 0) {
            loan.state = LoanState.Paid;

            // Return NFT to borrower
            transferNFT(loan.borrower, loan.nftId);

            emit LoanStateChange(loanId,(uint)(LoanState.Paid));
        }
    }

    // Retract a loan proposal
    function retractLoan(uint256 loanId) external {
        require(loanId < nextLoanId, "Loan doesn't exist");

        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Proposed, "Loan is not in Proposed state");
        require(msg.sender == loan.borrower, "Only the borrower can retract the loan");

        // Update loan
        loan.state = LoanState.Retracted;

        // Return NFT to borrower
        transferNFT(loan.borrower, loan.nftId);

        emit LoanStateChange(loanId,(uint)(LoanState.Retracted));
    }

    // Check if the loan has defaulted
    function checkState(uint256 loanId) external {
        require(loanId < nextLoanId, "Loan doesn't exist");
        Loan storage loan = loans[loanId];
        require(loan.state == LoanState.Funded, "Loan is not in Funded state");
        if (block.timestamp > loan.defaultDate) {
            loan.state = LoanState.Defaulted;

            // Transfer NFT to lender
            transferNFT(loan.lender, loan.nftId);
            emit LoanStateChange(loanId,(uint)(LoanState.Defaulted));
        }

        
    }

    function getLoanDetails(uint256 loanId) public view returns (address,address, uint,uint,uint,uint,LoanState) {

    Loan memory loan = loans[loanId];

    return (loan.borrower,
            loan.lender,
            loan.nftId,
            loan.amount,
            loan.interest,
            loan.daysForRepayment,
            loan.state);
    }


}


