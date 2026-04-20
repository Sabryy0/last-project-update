const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  requestRedemption,
  redeemWithMoney,
  getMyRedemptions,
  getPendingRedemptions,
  getAllRedemptions,
  approveRedeemWithBudgetCheck,
  getApprovedWaitingAcceptance,
  childAcceptRedemption,
  cancelRedemption,
  redeemEventSpot
} = require('../controllers/RedeemController');

const redeemRouter = express.Router();

redeemRouter.use(protect);

// Request redemption
redeemRouter.post('/request', requestRedemption);
redeemRouter.post('/with-money', redeemWithMoney);
redeemRouter.post('/event-spot', redeemEventSpot);
redeemRouter.get('/my-redemptions', getMyRedemptions);
redeemRouter.get('/approved-waiting', getApprovedWaitingAcceptance);
redeemRouter.delete('/:redeemId/cancel', cancelRedemption);

// Child accepts parent-approved redemption
redeemRouter.patch('/:redeemId/accept', childAcceptRedemption);

// Parent approves/rejects redemption requests
redeemRouter.get('/pending', restrictTo('Parent'), getPendingRedemptions);
redeemRouter.get('/all', restrictTo('Parent'), getAllRedemptions);
redeemRouter.patch('/:redeemId/approve', restrictTo('Parent'), approveRedeemWithBudgetCheck);
redeemRouter.patch('/:redeemId/parent-approve', restrictTo('Parent'), approveRedeemWithBudgetCheck);

module.exports = redeemRouter;
