// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract StakingPool {
    using SafeERC20 for IERC20;

    error InvalidTokenAddress();
    error InvalidAmount();
    error InsufficientBalance();

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardsClaimed;
    }

    // token => user => StakeInfo
    mapping(address => mapping(address => StakeInfo)) public stakes;

    // token => total staked
    mapping(address => uint256) public totalStaked;

    // Reward rate: ~10% APY (per-second calculation)
    uint256 public constant REWARD_RATE_PER_SECOND = 3170979198;

    event Staked(address indexed user, address indexed token, uint256 amount);
    event Unstaked(address indexed user, address indexed token, uint256 amount);
    event RewardsClaimed(address indexed user, address indexed token, uint256 amount);

    function stake(address token, uint256 amount) external {
        if (token == address(0)) revert InvalidTokenAddress();
        if (amount == 0) revert InvalidAmount();

        _claimRewards(token, msg.sender);

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        stakes[token][msg.sender].amount += amount;
        stakes[token][msg.sender].stakedAt = block.timestamp;
        totalStaked[token] += amount;

        emit Staked(msg.sender, token, amount);
    }

    function unstake(address token, uint256 amount) external {
        if (token == address(0)) revert InvalidTokenAddress();
        if (amount == 0) revert InvalidAmount();
        if (stakes[token][msg.sender].amount < amount) revert InsufficientBalance();

        _claimRewards(token, msg.sender);

        stakes[token][msg.sender].amount -= amount;
        totalStaked[token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);

        emit Unstaked(msg.sender, token, amount);
    }

    function claimRewards(address token) external {
        _claimRewards(token, msg.sender);
    }

    function getStakedBalance(address token, address user) external view returns (uint256) {
        return stakes[token][user].amount;
    }

    function getPendingRewards(address token, address user) external view returns (uint256) {
        return _calculateRewards(token, user);
    }

    function getStakeInfo(address token, address user) external view returns (uint256 amount, uint256 stakedAt, uint256 rewardsClaimed) {
        StakeInfo memory info = stakes[token][user];
        return (info.amount, info.stakedAt, info.rewardsClaimed);
    }

    function _claimRewards(address token, address user) internal {
        uint256 rewards = _calculateRewards(token, user);
        if (rewards > 0) {
            stakes[token][user].rewardsClaimed += rewards;
            stakes[token][user].stakedAt = block.timestamp;
            IERC20(token).safeTransfer(user, rewards);
            emit RewardsClaimed(user, token, rewards);
        }
    }

    /// @notice Returns how many reward tokens the pool can still distribute
    function rewardPoolBalance(address token) external view returns (uint256) {
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        return contractBalance > totalStaked[token]
            ? contractBalance - totalStaked[token]
            : 0;
    }

    function _calculateRewards(address token, address user) internal view returns (uint256) {
        StakeInfo memory info = stakes[token][user];
        if (info.amount == 0) return 0;
        uint256 duration = block.timestamp - info.stakedAt;
        return (info.amount * REWARD_RATE_PER_SECOND * duration) / 1e18;
    }
}
