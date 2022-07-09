#!/bin/sh
set -euxo
# ${1} = Account Number. Ex: 969171869770
# ${2} = Region. Ex: us-east-2
# ${3} = AWS Credentials Profile. Ex: sam

ACCOUNT_NUMBER="${1}"
REGION="${2}"
PROFILE="${3}"

if [ -z "${ACCOUNT_NUMBER}" ];
then
    echo "Account Number is required"
    exit 1
fi

if [ -z "${REGION}" ];
then
    echo "Region is required"
    exit 1
fi

if [ -z "${PROFILE}" ];
then
    echo "Profile is required"
    exit 1
fi

export CDK_DEFAULT_ACCOUNT="${ACCOUNT_NUMBER}"
export CDK_DEFAULT_REGION="${REGION}"

cdk context --clear
cdk deploy --profile="${PROFILE}" --require-approval=never

exit 0