import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Address, parseUnits } from 'viem';
import { MINIMUM_XDAI_TO_FUND_NODE } from '../../../../../config';
import GrayButton from '../../../../future-hopr-lib-components/Button/gray';
import { useEthersSigner } from '../../../../hooks';
import { ConfirmButton, StepContainer } from '../components';
import { StyledTextField } from '../styled';

// Store
import { FeedbackTransaction } from '../../../../components/FeedbackTransaction';
import { useAppDispatch, useAppSelector } from '../../../../store';
import { safeActionsAsync } from '../../../../store/slices/safe';
import { stakingHubActions } from '../../../../store/slices/stakingHub';

// MUI
import { Tooltip, TooltipProps, tooltipClasses } from '@mui/material';

const BlueTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#DAF8FF",
    color: '#414141',
    borderRadius: "10px",
    fontSize: "12px",
    boxShadow: "0px 4px 4px #00000040"
  },
}));


const StyledForm = styled.div`
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 1rem;
`;

const StyledInstructions = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
`;

const StyledText = styled.h3`
  color: var(--414141, #414141);
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.35px;
`;

const StyledInputGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const StyledCoinLabel = styled.p`
  color: var(--414141, #414141);
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 60px;
  letter-spacing: 0.35px;
`;

export const StyledGrayButton = styled(GrayButton)`
  border: 1px solid black;
  height: 39px;
`;

export default function FundNode() {
  const dispatch = useAppDispatch();
  // injected states
  const selectedSafeAddress = useAppSelector((store) => store.safe.selectedSafeAddress.data);
  const nodeAddress = useAppSelector((store) => store.stakingHub.onboarding.nodeAddress) as Address;
  const safeXDaiBalance = useAppSelector((store) => store.safe.balance.data.xDai.formatted) as string;
  const isExecutionLoading = useAppSelector((store) => store.safe.executeTransaction.isFetching);
  // local states
  const [xdaiValue, set_xdaiValue] = useState<string>('');
  const [error, set_error] = useState<boolean>(false);
  const [transactionHash, set_transactionHash] = useState<Address>();
  const [isWalletLoading, set_isWalletLoading] = useState(false);
  const signer = useEthersSigner();

  const createAndExecuteTx = () => {
    if (!signer || !Number(xdaiValue) || !selectedSafeAddress || !nodeAddress) return;
    set_isWalletLoading(true);
    dispatch(
      safeActionsAsync.createAndExecuteTransactionThunk({
        signer,
        safeAddress: selectedSafeAddress,
        safeTransactionData: {
          to: nodeAddress,
          value: parseUnits(xdaiValue as `${number}`, 18).toString(),
          data: '0x',
        },
      }),
    )
      .unwrap()
      .then((hash) => {
        set_transactionHash(hash as Address);
        dispatch(stakingHubActions.setOnboardingStep(15));
      })
      .catch(() => {
        set_error(true);
      })
      .finally(() => set_isWalletLoading(false));
  };

  useEffect(() => {
    if (safeXDaiBalance !== null && parseUnits(xdaiValue, 18) > parseUnits(safeXDaiBalance, 18)) {
      set_error(true);
    } else {
      set_error(false);
    }
  }, [xdaiValue]);

  return (
    <StepContainer
      title="FUND YOUR NODE WITH xDAI"
      image={{
        src: '/assets/fund_node_from_safe.png',
        height: 133,
      }}
      buttons={
        <ConfirmButton
          onClick={createAndExecuteTx}
          pending={isExecutionLoading}
          disabled={
            error ||
            xdaiValue === '' ||
            parseUnits(xdaiValue, 18) === parseUnits('0', 18) ||
            xdaiValue.includes('-') ||
            xdaiValue.includes('+')
          }
        >
          FUND
        </ConfirmButton>
      }
    >
      <div>
        <StyledForm>
          <StyledInstructions>
            <StyledText>SEND xDAI TO NODE {' '}
              <BlueTooltip title="Enter the amount of xDAI you would like to transfer from your Safe to your node." >
                <img src='/assets/question-icon.svg' style={{ height: "100%" }} />
              </BlueTooltip></StyledText>
          </StyledInstructions>
          <StyledInputGroup>
            <StyledTextField
              variant="outlined"
              placeholder="-"
              size="small"
              style={{ width: '300px' }}
              value={xdaiValue}
              onChange={(e) => set_xdaiValue(e.target.value)}
              type="number"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*',
              }}
              InputProps={{ inputProps: { style: { textAlign: 'right' } } }}
              helperText={error ? 'You do not have enough xDai in Safe.' : `min. ${MINIMUM_XDAI_TO_FUND_NODE}`}
              error={!!xdaiValue && error}
            />
            <StyledCoinLabel>xDAI</StyledCoinLabel>
            <StyledGrayButton onClick={() => set_xdaiValue('1')}>MIN</StyledGrayButton>
          </StyledInputGroup>
        </StyledForm>
        <FeedbackTransaction
          isWalletLoading={isWalletLoading}
          confirmations={1}
          transactionHash={transactionHash}
          feedbackTexts={{ loading: 'Please wait while we confirm the transaction...' }}
        />
      </div>
    </StepContainer>
  );
}
