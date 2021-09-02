/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { BinToken, BinTokenInterface } from "../BinToken";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051806040016040528060038152602001622134b760e91b815250604051806040016040528060038152602001622124a760e91b8152508181816005908051906020019062000064929190620003f3565b5080516200007a906006906020840190620003f3565b50506007805460ff19169055506200009460003362000102565b620000c07f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a63362000102565b620000ec7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a3362000102565b50620000fc905033600062000145565b620004fd565b6200011982826200023d60201b62000abd1760201c565b60008281526001602090815260409091206200014091839062000ac762000249821b17901c565b505050565b6001600160a01b038216620001a15760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f20616464726573730060448201526064015b60405180910390fd5b620001af6000838362000269565b8060046000828254620001c3919062000499565b90915550506001600160a01b03821660009081526002602052604081208054839290620001f290849062000499565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35b5050565b62000239828262000281565b600062000260836001600160a01b03841662000321565b90505b92915050565b620001408383836200037360201b62000ae91760201c565b6000828152602081815260408083206001600160a01b038516845290915290205460ff1662000239576000828152602081815260408083206001600160a01b03851684529091529020805460ff19166001179055620002dd3390565b6001600160a01b0316816001600160a01b0316837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b60008181526001830160205260408120546200036a5750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915562000263565b50600062000263565b6200038b8383836200014060201b620006981760201c565b60075460ff1615620001405760405162461bcd60e51b815260206004820152602a60248201527f45524332305061757361626c653a20746f6b656e207472616e736665722077686044820152691a5b19481c185d5cd95960b21b606482015260840162000198565b8280546200040190620004c0565b90600052602060002090601f01602090048101928262000425576000855562000470565b82601f106200044057805160ff191683800117855562000470565b8280016001018555821562000470579182015b828111156200047057825182559160200191906001019062000453565b506200047e92915062000482565b5090565b5b808211156200047e576000815560010162000483565b60008219821115620004bb57634e487b7160e01b600052601160045260246000fd5b500190565b600181811c90821680620004d557607f821691505b60208210811415620004f757634e487b7160e01b600052602260045260246000fd5b50919050565b611fa6806200050d6000396000f3fe608060405234801561001057600080fd5b50600436106101c45760003560e01c806370a08231116100f9578063a457c2d711610097578063d539139311610071578063d5391393146103fa578063d547741f14610421578063dd62ed3e14610434578063e63ab1e91461047a57600080fd5b8063a457c2d7146103c1578063a9059cbb146103d4578063ca15c873146103e757600080fd5b80639010d07c116100d35780639010d07c1461033557806391d148541461036d57806395d89b41146103b1578063a217fddf146103b957600080fd5b806370a08231146102e457806379cc67901461031a5780638456cb591461032d57600080fd5b8063313ce567116101665780633f4ba83a116101405780633f4ba83a146102ab57806340c10f19146102b357806342966c68146102c65780635c975abb146102d957600080fd5b8063313ce5671461027657806336568abe14610285578063395093511461029857600080fd5b806318160ddd116101a257806318160ddd1461021957806323b872dd1461022b578063248a9ca31461023e5780632f2ff15d1461026157600080fd5b806301ffc9a7146101c957806306fdde03146101f1578063095ea7b314610206575b600080fd5b6101dc6101d7366004611c7f565b6104a1565b60405190151581526020015b60405180910390f35b6101f96104fd565b6040516101e89190611d42565b6101dc610214366004611bf7565b61058f565b6004545b6040519081526020016101e8565b6101dc610239366004611bbb565b6105a5565b61021d61024c366004611c21565b60009081526020819052604090206001015490565b61027461026f366004611c3a565b610676565b005b604051601281526020016101e8565b610274610293366004611c3a565b61069d565b6101dc6102a6366004611bf7565b6106bf565b610274610708565b6102746102c1366004611bf7565b6107ae565b6102746102d4366004611c21565b610858565b60075460ff166101dc565b61021d6102f2366004611b6d565b73ffffffffffffffffffffffffffffffffffffffff1660009081526002602052604090205490565b610274610328366004611bf7565b610865565b6102746108ff565b610348610343366004611c5d565b6109a3565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020016101e8565b6101dc61037b366004611c3a565b60009182526020828152604080842073ffffffffffffffffffffffffffffffffffffffff93909316845291905290205460ff1690565b6101f96109c2565b61021d600081565b6101dc6103cf366004611bf7565b6109d1565b6101dc6103e2366004611bf7565b610a8f565b61021d6103f5366004611c21565b610a9c565b61021d7f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a681565b61027461042f366004611c3a565b610ab3565b61021d610442366004611b88565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260036020908152604080832093909416825291909152205490565b61021d7f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a81565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f5a05180f0000000000000000000000000000000000000000000000000000000014806104f757506104f782610b62565b92915050565b60606005805461050c90611e60565b80601f016020809104026020016040519081016040528092919081815260200182805461053890611e60565b80156105855780601f1061055a57610100808354040283529160200191610585565b820191906000526020600020905b81548152906001019060200180831161056857829003601f168201915b5050505050905090565b600061059c338484610bf9565b50600192915050565b60006105b2848484610d78565b73ffffffffffffffffffffffffffffffffffffffff841660009081526003602090815260408083203384529091529020548281101561065e5760405162461bcd60e51b815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206160448201527f6c6c6f77616e636500000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b61066b8533858403610bf9565b506001949350505050565b6106808282610fea565b60008281526001602052604090206106989082610ac7565b505050565b6106a78282611010565b600082815260016020526040902061069890826110a5565b33600081815260036020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909161059c918590610703908690611d93565b610bf9565b6107327f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a3361037b565b6107a45760405162461bcd60e51b815260206004820152603960248201527f45524332305072657365744d696e7465725061757365723a206d75737420686160448201527f76652070617573657220726f6c6520746f20756e7061757365000000000000006064820152608401610655565b6107ac6110c7565b565b6107d87f9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a63361037b565b61084a5760405162461bcd60e51b815260206004820152603660248201527f45524332305072657365744d696e7465725061757365723a206d75737420686160448201527f7665206d696e74657220726f6c6520746f206d696e74000000000000000000006064820152608401610655565b610854828261118e565b5050565b61086233826112a0565b50565b60006108718333610442565b9050818110156108e85760405162461bcd60e51b8152602060048201526024808201527f45524332303a206275726e20616d6f756e74206578636565647320616c6c6f7760448201527f616e6365000000000000000000000000000000000000000000000000000000006064820152608401610655565b6108f58333848403610bf9565b61069883836112a0565b6109297f65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a3361037b565b61099b5760405162461bcd60e51b815260206004820152603760248201527f45524332305072657365744d696e7465725061757365723a206d75737420686160448201527f76652070617573657220726f6c6520746f2070617573650000000000000000006064820152608401610655565b6107ac611465565b60008281526001602052604081206109bb908361150b565b9392505050565b60606006805461050c90611e60565b33600090815260036020908152604080832073ffffffffffffffffffffffffffffffffffffffff8616845290915281205482811015610a785760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f0000000000000000000000000000000000000000000000000000006064820152608401610655565b610a853385858403610bf9565b5060019392505050565b600061059c338484610d78565b60008181526001602052604081206104f790611517565b6106a78282611521565b6108548282611547565b60006109bb8373ffffffffffffffffffffffffffffffffffffffff8416611637565b60075460ff16156106985760405162461bcd60e51b815260206004820152602a60248201527f45524332305061757361626c653a20746f6b656e207472616e7366657220776860448201527f696c6520706175736564000000000000000000000000000000000000000000006064820152608401610655565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f7965db0b0000000000000000000000000000000000000000000000000000000014806104f757507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316146104f7565b73ffffffffffffffffffffffffffffffffffffffff8316610c815760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610655565b73ffffffffffffffffffffffffffffffffffffffff8216610d0a5760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f73730000000000000000000000000000000000000000000000000000000000006064820152608401610655565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526003602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316610e015760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610655565b73ffffffffffffffffffffffffffffffffffffffff8216610e8a5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f65737300000000000000000000000000000000000000000000000000000000006064820152608401610655565b610e95838383611686565b73ffffffffffffffffffffffffffffffffffffffff831660009081526002602052604090205481811015610f315760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610655565b73ffffffffffffffffffffffffffffffffffffffff808516600090815260026020526040808220858503905591851681529081208054849290610f75908490611d93565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610fdb91815260200190565b60405180910390a35b50505050565b6000828152602081905260409020600101546110068133611691565b6106988383611547565b73ffffffffffffffffffffffffffffffffffffffff8116331461109b5760405162461bcd60e51b815260206004820152602f60248201527f416363657373436f6e74726f6c3a2063616e206f6e6c792072656e6f756e636560448201527f20726f6c657320666f722073656c6600000000000000000000000000000000006064820152608401610655565b6108548282611747565b60006109bb8373ffffffffffffffffffffffffffffffffffffffff84166117fe565b60075460ff166111195760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f74207061757365640000000000000000000000006044820152606401610655565b600780547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa335b60405173ffffffffffffffffffffffffffffffffffffffff909116815260200160405180910390a1565b73ffffffffffffffffffffffffffffffffffffffff82166111f15760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610655565b6111fd60008383611686565b806004600082825461120f9190611d93565b909155505073ffffffffffffffffffffffffffffffffffffffff821660009081526002602052604081208054839290611249908490611d93565b909155505060405181815273ffffffffffffffffffffffffffffffffffffffff8316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b73ffffffffffffffffffffffffffffffffffffffff82166113295760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f2061646472657360448201527f73000000000000000000000000000000000000000000000000000000000000006064820152608401610655565b61133582600083611686565b73ffffffffffffffffffffffffffffffffffffffff8216600090815260026020526040902054818110156113d15760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e60448201527f63650000000000000000000000000000000000000000000000000000000000006064820152608401610655565b73ffffffffffffffffffffffffffffffffffffffff8316600090815260026020526040812083830390556004805484929061140d908490611de8565b909155505060405182815260009073ffffffffffffffffffffffffffffffffffffffff8516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a3505050565b60075460ff16156114b85760405162461bcd60e51b815260206004820152601060248201527f5061757361626c653a20706175736564000000000000000000000000000000006044820152606401610655565b600780547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586111643390565b60006109bb83836118f1565b60006104f7825490565b60008281526020819052604090206001015461153d8133611691565b6106988383611747565b60008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff8516845290915290205460ff166108545760008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff85168452909152902080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff001660011790556115d93390565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16837f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d60405160405180910390a45050565b600081815260018301602052604081205461167e575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556104f7565b5060006104f7565b610698838383610ae9565b60008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff8516845290915290205460ff16610854576116e78173ffffffffffffffffffffffffffffffffffffffff16601461191b565b6116f283602061191b565b604051602001611703929190611cc1565b604080517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe08184030181529082905262461bcd60e51b825261065591600401611d42565b60008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff8516845290915290205460ff16156108545760008281526020818152604080832073ffffffffffffffffffffffffffffffffffffffff8516808552925280832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016905551339285917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b9190a45050565b600081815260018301602052604081205480156118e7576000611822600183611de8565b855490915060009061183690600190611de8565b905081811461189b57600086600001828154811061185657611856611f12565b906000526020600020015490508087600001848154811061187957611879611f12565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806118ac576118ac611ee3565b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506104f7565b60009150506104f7565b600082600001828154811061190857611908611f12565b9060005260206000200154905092915050565b6060600061192a836002611dab565b611935906002611d93565b67ffffffffffffffff81111561194d5761194d611f41565b6040519080825280601f01601f191660200182016040528015611977576020820181803683370190505b5090507f3000000000000000000000000000000000000000000000000000000000000000816000815181106119ae576119ae611f12565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f780000000000000000000000000000000000000000000000000000000000000081600181518110611a1157611a11611f12565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053506000611a4d846002611dab565b611a58906001611d93565b90505b6001811115611af5577f303132333435363738396162636465660000000000000000000000000000000085600f1660108110611a9957611a99611f12565b1a60f81b828281518110611aaf57611aaf611f12565b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a90535060049490941c93611aee81611e2b565b9050611a5b565b5083156109bb5760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e746044820152606401610655565b803573ffffffffffffffffffffffffffffffffffffffff81168114611b6857600080fd5b919050565b600060208284031215611b7f57600080fd5b6109bb82611b44565b60008060408385031215611b9b57600080fd5b611ba483611b44565b9150611bb260208401611b44565b90509250929050565b600080600060608486031215611bd057600080fd5b611bd984611b44565b9250611be760208501611b44565b9150604084013590509250925092565b60008060408385031215611c0a57600080fd5b611c1383611b44565b946020939093013593505050565b600060208284031215611c3357600080fd5b5035919050565b60008060408385031215611c4d57600080fd5b82359150611bb260208401611b44565b60008060408385031215611c7057600080fd5b50508035926020909101359150565b600060208284031215611c9157600080fd5b81357fffffffff00000000000000000000000000000000000000000000000000000000811681146109bb57600080fd5b7f416363657373436f6e74726f6c3a206163636f756e7420000000000000000000815260008351611cf9816017850160208801611dff565b7f206973206d697373696e6720726f6c65200000000000000000000000000000006017918401918201528351611d36816028840160208801611dff565b01602801949350505050565b6020815260008251806020840152611d61816040850160208701611dff565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169190910160400192915050565b60008219821115611da657611da6611eb4565b500190565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615611de357611de3611eb4565b500290565b600082821015611dfa57611dfa611eb4565b500390565b60005b83811015611e1a578181015183820152602001611e02565b83811115610fe45750506000910152565b600081611e3a57611e3a611eb4565b507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0190565b600181811c90821680611e7457607f821691505b60208210811415611eae577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfea26469706673582212202be90ef9ec2067d4c7ad60ec941957f15bcb72c0adfc7eb2babbc91a35e4a7d964736f6c63430008070033";

export class BinToken__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<BinToken> {
    return super.deploy(overrides || {}) as Promise<BinToken>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): BinToken {
    return super.attach(address) as BinToken;
  }
  connect(signer: Signer): BinToken__factory {
    return super.connect(signer) as BinToken__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BinTokenInterface {
    return new utils.Interface(_abi) as BinTokenInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): BinToken {
    return new Contract(address, _abi, signerOrProvider) as BinToken;
  }
}
