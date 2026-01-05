// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract SyncFlowAgent is Ownable {
    string public agentName;
    string public agentType;
    
    event AgentAction(string action, string params, uint256 timestamp);
    
    constructor(string memory _name, string memory _type) Ownable(msg.sender) {
        agentName = _name;
        agentType = _type;
    }

    function execute(string memory action, string memory params) external onlyOwner {
        emit AgentAction(action, params, block.timestamp);
    }
    
    function deposit() external payable {}
    
    // Allow contract to receive plain TCRO transfers
    receive() external payable {}
    
    // Event for batch transfers
    event BatchTransfer(address indexed recipient, uint256 amount, uint256 timestamp);
    
    /**
     * @dev Batch transfer TCRO to multiple recipients from contract balance
     * @param recipients Array of recipient addresses
     * @param amounts Array of amounts to send (in wei)
     */
    function batchTransfer(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays length mismatch");
        require(recipients.length > 0, "No recipients provided");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(address(this).balance >= totalAmount, "Insufficient contract balance");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Invalid recipient address");
            require(amounts[i] > 0, "Amount must be greater than 0");
            
            (bool success, ) = payable(recipients[i]).call{value: amounts[i]}("");
            require(success, "Transfer failed");
            
            emit BatchTransfer(recipients[i], amounts[i], block.timestamp);
        }
    }
    
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
}
