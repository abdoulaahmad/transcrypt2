import { useEffect, useState } from "react";
import { useAccount, usePublicClient } from "wagmi";

import { registryAbi, registryAddress } from "../lib/contract";

type Address = `0x${string}`;

export interface RoleState {
  isConnected: boolean;
  address?: Address;
  loading: boolean;
  roles: {
    isUniversity: boolean;
    isRegistrar: boolean;
    isMinistry: boolean;
    isAdmin: boolean;
  };
  error?: string;
}

export function useRoles(): RoleState {
  const { address, isConnecting, isReconnecting } = useAccount();
  const publicClient = usePublicClient();
  const [state, setState] = useState<RoleState>({
    isConnected: false,
    address: undefined,
    loading: isConnecting || isReconnecting,
    roles: {
      isUniversity: false,
      isRegistrar: false,
      isMinistry: false,
      isAdmin: false
    }
  });

  useEffect(() => {
    let cancelled = false;

    if (!address || !publicClient) {
      setState({
        isConnected: false,
        address: undefined,
        loading: isConnecting || isReconnecting,
        roles: {
          isUniversity: false,
          isRegistrar: false,
          isMinistry: false,
          isAdmin: false
        }
      });
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
  setState((prevState: RoleState) => ({
          ...prevState,
          loading: true,
          error: undefined
        }));

        const [uRole, rRole, mRole, adminRole] = await Promise.all([
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "UNIVERSITY_ROLE"
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "REGISTRAR_ROLE"
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "MINISTRY_ROLE"
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "DEFAULT_ADMIN_ROLE"
          })
        ]);

        const [isUniversity, isRegistrar, isMinistry, isAdmin] = await Promise.all([
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "hasRole",
            args: [uRole, address]
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "hasRole",
            args: [rRole, address]
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "hasRole",
            args: [mRole, address]
          }),
          publicClient.readContract({
            address: registryAddress,
            abi: registryAbi,
            functionName: "hasRole",
            args: [adminRole, address]
          })
        ]);

        if (cancelled) return;

        setState({
          isConnected: true,
          address,
          loading: false,
          roles: {
            isUniversity: Boolean(isUniversity),
            isRegistrar: Boolean(isRegistrar),
            isMinistry: Boolean(isMinistry),
            isAdmin: Boolean(isAdmin)
          }
        });
      } catch (error) {
        if (cancelled) return;
        setState({
          isConnected: true,
          address,
          loading: false,
          error: (error as Error).message,
          roles: {
            isUniversity: false,
            isRegistrar: false,
            isMinistry: false,
            isAdmin: false
          }
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, publicClient, isConnecting, isReconnecting]);

  return state;
}
