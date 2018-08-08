import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { pick, isArray } from 'lodash';

const createOrderQuery = gql`
  mutation createOrder($order: OrderInputType!) {
    createOrder(order: $order) {
      id,
      createdAt,
      createdByUser {
        id,
      },
      fromCollective {
        id,
        slug
      }
      collective {
        id,
        slug
      }
    }
  }
`;

const createMemberQuery = gql`
mutation createMember($member: CollectiveAttributesInputType!, $collective: CollectiveAttributesInputType!, $role: String!) {
  createMember(member: $member, collective: $collective, role: $role) {
    id
    createdAt
    member {
      id
      name
      image
      slug
      twitterHandle
      description
    }
    role
  }
}
`;

const removeMemberQuery = gql`
  mutation removeMember($member: CollectiveAttributesInputType!, $collective: CollectiveAttributesInputType!, $role: String!) {
    removeMember(member: $member, collective: $collective, role: $role) {
      id
    }
  }
`;


const createCollectiveQuery = gql`
  mutation createCollective($collective: CollectiveInputType!) {
    createCollective(collective: $collective) {
      id
      slug
    }
  }
`;

const editCollectiveQuery = gql`
  mutation editCollective($collective: CollectiveInputType!) {
    editCollective(collective: $collective) {
      id
      type
      slug
      name
      image
      backgroundImage
      description
      longDescription
      website
      twitterHandle
      host {
        id
        createdAt
        slug
        name
        image
        description
        website
        twitterHandle
        stats {
          id
          collectives {
            hosted
          }
        }
      }
      members(roles: ["ADMIN", "MEMBER", "HOST"]) {
        id
        createdAt
        role
        description
      }
    }
  }
`;

const editTiersQuery = gql`
  mutation editTiers($id: Int!, $tiers: [TierInputType]!) {
    editTiers(id: $id, tiers: $tiers) {
      id,
      type,
      name,
      amount
    }
  }
`;

const deleteCollectiveQuery = gql`
  mutation deleteCollective($id: Int!) {
    deleteCollective(id: $id) {
      id
    }
  }
`;

export const addCreateOrderMutation = graphql(createOrderQuery, {
  props: ( { mutate }) => ({
    createOrder: (order) => mutate({ variables: { order } })
  })
});

export const addCreateMemberMutation = graphql(createMemberQuery, {
  props: ( { mutate }) => ({
    createMember: (member, collective, role) => mutate({ variables: { member, collective, role } })
  })
});

export const addRemoveMemberMutation = graphql(removeMemberQuery, {
  props: ( { mutate }) => ({
    removeMember: (member, collective, role) => mutate({ variables: { member, collective, role } })
  })
});

export const addEventMutations = compose(addCreateOrderMutation, addCreateMemberMutation, addRemoveMemberMutation);

export const addCreateCollectiveMutation = graphql(createCollectiveQuery, {
  props: ( { mutate }) => ({
    createCollective: async (collective) => {
      const CollectiveInputType = pick(collective, [
        'slug',
        'type',
        'name',
        'image',
        'description',
        'longDescription',
        'location',
        'twitterHandle',
        'website',
        'tags',
        'startsAt',
        'endsAt',
        'timezone',
        'maxAmount',
        'currency',
        'quantity',
        'HostCollectiveId',
        'ParentCollectiveId',
        'data'
      ]);
      CollectiveInputType.tiers = (collective.tiers || []).map(tier => pick(tier, ['type', 'name', 'description', 'amount', 'maxQuantity', 'maxQuantityPerUser']));
      CollectiveInputType.location = pick(collective.location, ['name','address','lat','long']);
      return await mutate({ variables: { collective: CollectiveInputType } })
    }
  })
});

export const addEditCollectiveMutation = graphql(editCollectiveQuery, {
  props: ( { mutate }) => ({
    editCollective: async (collective) => {
      const CollectiveInputType = pick(collective, [
        'id',
        'type',
        'slug',
        'name',
        'company',
        'description',
        'longDescription',
        'tags',
        'expensePolicy',
        'website',
        'twitterHandle',
        'location',
        'startsAt',
        'endsAt',
        'timezone',
        'maxAmount',
        'currency',
        'quantity',
        'ParentCollectiveId',
        'HostCollectiveId',
        'image',
        'backgroundImage',
        'settings'
      ]);
      if (collective.paymentMethods && collective.paymentMethods.length > 0) {
        CollectiveInputType.paymentMethods = collective.paymentMethods.map(pm => pick(pm, ['id', 'name', 'token', 'data', 'monthlyLimitPerMember', 'currency']));
      } else {
        CollectiveInputType.paymentMethods = []; // force removing existing payment methods
      }
      if (isArray(collective.tiers)) {
        CollectiveInputType.tiers = collective.tiers.map(tier => pick(tier, ['id', 'type', 'name', 'description', 'amount', 'interval', 'maxQuantity', 'maxQuantityPerUser', 'presets']));
      }
      if (isArray(collective.members)) {
        CollectiveInputType.members = collective.members.map(member => {
          return {
            id: member.id,
            role: member.role,
            description: member.description,
            member: {
              name: member.member.name,
              email: member.member.email
            }
          }
        });
      }
      CollectiveInputType.location = pick(collective.location, ['name','address','lat','long']);
      return await mutate({ variables: { collective: CollectiveInputType } })
    }
  })
});

export const addEditTiersMutation = graphql(editTiersQuery, {
  props: ( { mutate }) => ({
    editTiers: async (collectiveSlug, tiers) => {
      tiers = tiers.map(tier => pick(tier, ['id', 'type', 'name', 'description', 'amount', 'maxQuantity', 'maxQuantityPerUser', 'interval', 'endsAt']));
      return await mutate({ variables: { collectiveSlug, tiers } })
    }
  })
});

export const addDeleteCollectiveMutation = graphql(deleteCollectiveQuery, {
  props: ( { mutate }) => ({
    deleteCollective: async (id) => {
      return await mutate({ variables: { id } })
    }
  })
});
