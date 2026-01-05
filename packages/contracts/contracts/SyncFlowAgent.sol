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
    
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }
}
